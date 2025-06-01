from fastapi import FastAPI, HTTPException
from kubernetes import client, config

app = FastAPI()

# Configure Kubernetes client
try:
    config.load_incluster_config()
except config.ConfigException:
    try:
        config.load_kube_config()
    except config.ConfigException as e:
        raise RuntimeError(f"Could not configure Kubernetes client: {e}")

core_v1 = client.CoreV1Api()
apps_v1 = client.AppsV1Api()
networking_v1 = client.NetworkingV1Api()

def transform_services(services_data):
    nodes = []
    edges = []
    for item in services_data.get('items', []):
        service_name = item.get('metadata', {}).get('name')
        namespace = item.get('metadata', {}).get('namespace')
        service_id = f"service_{namespace}_{service_name}"
        nodes.append({
            "id": service_id,
            "type": "service",
            "name": service_name,
            "namespace": namespace,
            "ports": item.get('spec', {}).get('ports', []),
            "selector": item.get('spec', {}).get('selector', {}),
        })
    return nodes, edges

def transform_pods(pods_data, service_selector_map):
    nodes = []
    edges = []
    for item in pods_data.get('items', []):
        pod_name = item.get('metadata', {}).get('name')
        namespace = item.get('metadata', {}).get('namespace')
        pod_id = f"pod_{namespace}_{pod_name}"
        pod_labels = item.get('metadata', {}).get('labels', {})
        nodes.append({
            "id": pod_id,
            "type": "pod",
            "name": pod_name,
            "namespace": namespace,
            "status": item.get('status', {}).get('phase'),
            "labels": pod_labels,
            "containers": [c.get('name') for c in item.get('spec', {}).get('containers', [])],
        })
        # Connect pod to service if labels match
        for service_id, selector in service_selector_map.items():
            if all(pod_labels.get(k) == v for k, v in selector.items()):
                edges.append({"from": service_id, "to": pod_id, "type": "selector"})

        # Connect pod to configmaps/secrets (basic example based on volume mounts)
        for volume in item.get('spec', {}).get('volumes', []):
            if volume.get('configMap'):
                cm_name = volume.get('configMap').get('name')
                edges.append({"from": pod_id, "to": f"configmap_{namespace}_{cm_name}", "type": "mount"})
            if volume.get('secret'):
                secret_name = volume.get('secret').get('secretName')
                edges.append({"from": pod_id, "to": f"secret_{namespace}_{secret_name}", "type": "mount"})

    return nodes, edges

def transform_deployments(deployments_data):
    nodes = []
    edges = []
    for item in deployments_data.get('items', []):
        deployment_name = item.get('metadata', {}).get('name')
        namespace = item.get('metadata', {}).get('namespace')
        deployment_id = f"deployment_{namespace}_{deployment_name}"
        match_labels = item.get('spec', {}).get('selector', {}).get('matchLabels', {})
        nodes.append({
            "id": deployment_id,
            "type": "deployment",
            "name": deployment_name,
            "namespace": namespace,
            "replicas": item.get('spec', {}).get('replicas'),
            "match_labels": match_labels
        })
        # Edges from deployment to pods are implicitly handled by service->pod if selectors align
        # or could be added if direct deployment->pod links are needed.
    return nodes, edges

def transform_ingresses(ingresses_data):
    nodes = []
    edges = []
    for item in ingresses_data.get('items', []):
        ingress_name = item.get('metadata', {}).get('name')
        namespace = item.get('metadata', {}).get('namespace')
        ingress_id = f"ingress_{namespace}_{ingress_name}"
        nodes.append({
            "id": ingress_id,
            "type": "ingress",
            "name": ingress_name,
            "namespace": namespace,
            "rules": item.get('spec', {}).get('rules', []),
        })
        for rule in item.get('spec', {}).get('rules', []):
            for path in rule.get('http', {}).get('paths', []):
                service_name = path.get('backend', {}).get('service', {}).get('name')
                if service_name:
                    service_id = f"service_{namespace}_{service_name}"
                    edges.append({"from": ingress_id, "to": service_id, "type": "route"})
    return nodes, edges

def transform_configmaps(configmaps_data):
    nodes = []
    for item in configmaps_data.get('items', []):
        cm_name = item.get('metadata', {}).get('name')
        namespace = item.get('metadata', {}).get('namespace')
        nodes.append({
            "id": f"configmap_{namespace}_{cm_name}",
            "type": "configmap",
            "name": cm_name,
            "namespace": namespace,
        })
    return nodes, [] # No edges from configmaps typically

def transform_secrets(secrets_data):
    nodes = []
    for item in secrets_data.get('items', []):
        secret_name = item.get('metadata', {}).get('name')
        namespace = item.get('metadata', {}).get('namespace')
        nodes.append({
            "id": f"secret_{namespace}_{secret_name}",
            "type": "secret",
            "name": secret_name,
            "namespace": namespace,
            # "data": item.get('data') # Be very careful with exposing secret data
        })
    return nodes, [] # No edges from secrets typically


@app.get("/api/service-map")
async def get_service_map_data():
    try:
        services_raw = core_v1.list_service_for_all_namespaces().to_dict()
        pods_raw = core_v1.list_pod_for_all_namespaces().to_dict()
        deployments_raw = apps_v1.list_deployment_for_all_namespaces().to_dict()
        ingresses_raw = networking_v1.list_ingress_for_all_namespaces().to_dict()
        configmaps_raw = core_v1.list_config_map_for_all_namespaces().to_dict()
        secrets_raw = core_v1.list_secret_for_all_namespaces().to_dict()

        all_nodes = []
        all_edges = []

        service_nodes, service_edges = transform_services(services_raw)
        all_nodes.extend(service_nodes)
        all_edges.extend(service_edges)

        # Create a map of service selectors for pod linking
        service_selector_map = {s['id']: s['selector'] for s in service_nodes if s['selector']}

        pod_nodes, pod_edges = transform_pods(pods_raw, service_selector_map)
        all_nodes.extend(pod_nodes)
        all_edges.extend(pod_edges)

        # Add edges from deployments to services (if matching labels - simplified)
        # A more accurate model would go deployment -> replicaset -> pod
        deployment_nodes, deployment_edges = transform_deployments(deployments_raw)
        all_nodes.extend(deployment_nodes)
        all_edges.extend(deployment_edges)
        for dep_node in deployment_nodes:
            dep_labels = dep_node.get('match_labels', {})
            if not dep_labels:
                continue
            for svc_node in service_nodes:
                svc_selector = svc_node.get('selector', {})
                if all(dep_labels.get(k) == v for k, v in svc_selector.items()):
                     # Check if service namespace matches deployment namespace for simplicity
                    if svc_node['namespace'] == dep_node['namespace']:
                        all_edges.append({"from": dep_node['id'], "to": svc_node['id'], "type": "manages"})


        ingress_nodes, ingress_edges = transform_ingresses(ingresses_raw)
        all_nodes.extend(ingress_nodes)
        all_edges.extend(ingress_edges)

        cm_nodes, cm_edges = transform_configmaps(configmaps_raw)
        all_nodes.extend(cm_nodes)
        all_edges.extend(cm_edges)

        secret_nodes, secret_edges = transform_secrets(secrets_raw)
        all_nodes.extend(secret_nodes)
        all_edges.extend(secret_edges)

        # Remove duplicate edges (e.g. pod might be linked multiple times if selectors overlap)
        # A more robust solution might use a set of tuples for edges before converting to list of dicts
        unique_edges = [dict(t) for t in {tuple(d.items()) for d in all_edges}]


        return {
            "nodes": all_nodes,
            "edges": unique_edges,
        }
    except client.ApiException as e:
        raise HTTPException(status_code=e.status, detail=f"Kubernetes API error: {e.reason} - {e.body}")
    except Exception as e:
        # Log the full traceback for unexpected errors
        import traceback
        print(f"An unexpected error occurred: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred: {str(e)}")
