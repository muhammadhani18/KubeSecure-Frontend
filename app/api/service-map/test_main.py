import pytest
from httpx import AsyncClient
from unittest.mock import patch, MagicMock

# Import the FastAPI app instance
from .main import app, core_v1, apps_v1, networking_v1, client as k8s_client_main

# Mock Kubernetes API responses
MOCK_SERVICES = {
    "items": [
        {
            "metadata": {"name": "service-1", "namespace": "ns-1"},
            "spec": {"selector": {"app": "app-1"}, "ports": [{"port": 80}]},
        }
    ]
}
MOCK_PODS = {
    "items": [
        {
            "metadata": {"name": "pod-1", "namespace": "ns-1", "labels": {"app": "app-1"}},
            "spec": {"containers": [{"name": "container-1"}]},
            "status": {"phase": "Running"},
        }
    ]
}
MOCK_DEPLOYMENTS = {
    "items": [
        {
            "metadata": {"name": "dep-1", "namespace": "ns-1"},
            "spec": {"replicas": 1, "selector": {"matchLabels": {"app": "app-1"}}},
        }
    ]
}
MOCK_INGRESSES = {
    "items": [
        {
            "metadata": {"name": "ingress-1", "namespace": "ns-1"},
            "spec": {
                "rules": [
                    {
                        "http": {
                            "paths": [
                                {"backend": {"service": {"name": "service-1"}}}
                            ]
                        }
                    }
                ]
            },
        }
    ]
}
MOCK_CONFIGMAPS = {
    "items": [{"metadata": {"name": "cm-1", "namespace": "ns-1"}}]
}
MOCK_SECRETS = {
    "items": [{"metadata": {"name": "secret-1", "namespace": "ns-1"}}]
}

@pytest.fixture
def mock_k8s_apis():
    with patch.object(core_v1, 'list_service_for_all_namespaces', return_value=MagicMock(to_dict=lambda: MOCK_SERVICES)), \
         patch.object(core_v1, 'list_pod_for_all_namespaces', return_value=MagicMock(to_dict=lambda: MOCK_PODS)), \
         patch.object(apps_v1, 'list_deployment_for_all_namespaces', return_value=MagicMock(to_dict=lambda: MOCK_DEPLOYMENTS)), \
         patch.object(networking_v1, 'list_ingress_for_all_namespaces', return_value=MagicMock(to_dict=lambda: MOCK_INGRESSES)), \
         patch.object(core_v1, 'list_config_map_for_all_namespaces', return_value=MagicMock(to_dict=lambda: MOCK_CONFIGMAPS)), \
         patch.object(core_v1, 'list_secret_for_all_namespaces', return_value=MagicMock(to_dict=lambda: MOCK_SECRETS)):
        yield

@pytest.fixture
def mock_k8s_empty_apis():
    with patch.object(core_v1, 'list_service_for_all_namespaces', return_value=MagicMock(to_dict=lambda: {"items": []})), \
         patch.object(core_v1, 'list_pod_for_all_namespaces', return_value=MagicMock(to_dict=lambda: {"items": []})), \
         patch.object(apps_v1, 'list_deployment_for_all_namespaces', return_value=MagicMock(to_dict=lambda: {"items": []})), \
         patch.object(networking_v1, 'list_ingress_for_all_namespaces', return_value=MagicMock(to_dict=lambda: {"items": []})), \
         patch.object(core_v1, 'list_config_map_for_all_namespaces', return_value=MagicMock(to_dict=lambda: {"items": []})), \
         patch.object(core_v1, 'list_secret_for_all_namespaces', return_value=MagicMock(to_dict=lambda: {"items": []})):
        yield

@pytest.fixture
def mock_k8s_api_exception():
    with patch.object(core_v1, 'list_service_for_all_namespaces', side_effect=k8s_client_main.ApiException(status=500, reason="Internal Server Error")):
        yield


@pytest.mark.asyncio
async def test_get_service_map_data_success(mock_k8s_apis):
    async with AsyncClient(app=app, base_url="http://test") as ac:
        response = await ac.get("/api/service-map")
    assert response.status_code == 200
    data = response.json()
    assert "nodes" in data
    assert "edges" in data
    assert len(data["nodes"]) > 0  # Based on mock data
    assert len(data["edges"]) > 0  # Based on mock data, e.g. ingress to service, service to pod

    # Check for specific nodes (examples)
    assert any(node["id"] == "service_ns-1_service-1" for node in data["nodes"])
    assert any(node["id"] == "pod_ns-1_pod-1" for node in data["nodes"])
    assert any(node["id"] == "deployment_ns-1_dep-1" for node in data["nodes"])
    assert any(node["id"] == "ingress_ns-1_ingress-1" for node in data["nodes"])
    assert any(node["id"] == "configmap_ns-1_cm-1" for node in data["nodes"])
    assert any(node["id"] == "secret_ns-1_secret-1" for node in data["nodes"])

    # Check for specific edges (examples)
    assert any(edge["from"] == "ingress_ns-1_ingress-1" and edge["to"] == "service_ns-1_service-1" for edge in data["edges"])
    assert any(edge["from"] == "service_ns-1_service-1" and edge["to"] == "pod_ns-1_pod-1" for edge in data["edges"])
    assert any(edge["from"] == "deployment_ns-1_dep-1" and edge["to"] == "service_ns-1_service-1" for edge in data["edges"])


@pytest.mark.asyncio
async def test_get_service_map_data_empty_cluster(mock_k8s_empty_apis):
    async with AsyncClient(app=app, base_url="http://test") as ac:
        response = await ac.get("/api/service-map")
    assert response.status_code == 200
    data = response.json()
    assert "nodes" in data
    assert "edges" in data
    assert len(data["nodes"]) == 0
    assert len(data["edges"]) == 0

@pytest.mark.asyncio
async def test_get_service_map_data_k8s_api_error(mock_k8s_api_exception):
    async with AsyncClient(app=app, base_url="http://test") as ac:
        response = await ac.get("/api/service-map")
    assert response.status_code == 500 # Matches the HTTPException in main.py
    data = response.json()
    assert "detail" in data
    assert "Kubernetes API error" in data["detail"]

# Example of testing missing resource types (e.g., no ingresses)
MOCK_SERVICES_NO_INGRESS = MOCK_SERVICES.copy()
MOCK_PODS_NO_INGRESS = MOCK_PODS.copy()
# ... copy other mocks

@pytest.fixture
def mock_k8s_no_ingresses():
     with patch.object(core_v1, 'list_service_for_all_namespaces', return_value=MagicMock(to_dict=lambda: MOCK_SERVICES_NO_INGRESS)), \
         patch.object(core_v1, 'list_pod_for_all_namespaces', return_value=MagicMock(to_dict=lambda: MOCK_PODS_NO_INGRESS)), \
         patch.object(apps_v1, 'list_deployment_for_all_namespaces', return_value=MagicMock(to_dict=lambda: MOCK_DEPLOYMENTS)), \
         patch.object(networking_v1, 'list_ingress_for_all_namespaces', return_value=MagicMock(to_dict=lambda: {"items": []})), \
         patch.object(core_v1, 'list_config_map_for_all_namespaces', return_value=MagicMock(to_dict=lambda: MOCK_CONFIGMAPS)), \
         patch.object(core_v1, 'list_secret_for_all_namespaces', return_value=MagicMock(to_dict=lambda: MOCK_SECRETS)):
        yield

@pytest.mark.asyncio
async def test_get_service_map_data_no_ingresses(mock_k8s_no_ingresses):
    async with AsyncClient(app=app, base_url="http://test") as ac:
        response = await ac.get("/api/service-map")
    assert response.status_code == 200
    data = response.json()
    assert "nodes" in data
    assert "edges" in data
    assert not any(node["type"] == "ingress" for node in data["nodes"])
    # Edges related to ingresses should also be absent
    assert not any("ingress_" in edge["from"] or "ingress_" in edge["to"] for edge in data["edges"])

# It's good practice to also mock the config loading part if it's complex,
# but for these tests, we are directly mocking the API client calls (core_v1, etc.)
# so the actual config loading in main.py doesn't affect these specific unit tests.
# If config loading itself had issues, it would be caught before these handlers are called.
# For this test suite, we assume config loading is successful as it's outside the scope of this endpoint's direct logic.

# To run these tests:
# Ensure you are in the /app directory or adjust paths.
# Run: python -m pytest app/api/service-map/test_main.py
# (You might need to set PYTHONPATH if imports are tricky, e.g. PYTHONPATH=. python -m pytest ...)
# Or if pytest is configured project-wide, just `pytest`.
# The FastAPI app instance is imported as `app` from `.main`.
# The k8s client instances (core_v1, etc.) are also imported from `.main` to allow patching.
# Patching `kubernetes.client.CoreV1Api` etc. globally might also work but patching
# the instances already imported and used by the app is more direct.
# Note: The actual `from .main import app, core_v1 ...` assumes `test_main.py` is in the same directory as `main.py`.
# If your test structure is different (e.g. a separate /tests folder), adjust imports.
# For example, if tests are in /tests/api/service-map, imports might be `from app.api.service-map.main import app, ...`
# and you'd run pytest from the project root.
# The current setup assumes tests are co-located with the code.
# For this example, let's assume they are co-located.
# The file path `app/api/service-map/test_main.py` suggests co-location.
# The import `from .main import app` is key.
# `k8s_client_main` is used to reference `client.ApiException` from the main module's context.
# This ensures we're catching the exact exception type the main module would see.
# This is important because if `kubernetes.client.ApiException` was imported directly in tests,
# it might be a different object if mocking/patching affects the main module's import.
# (Though for exceptions, direct import usually works fine unless the module itself is replaced).
# Using `k8s_client_main.ApiException` is just safer.
# The `client` in `from .main import ... client as k8s_client_main` refers to the `kubernetes.client` module
# that was imported in `main.py`.
# This is a common pattern for ensuring mocks and exceptions are handled correctly.
# Consider adding a conftest.py for shared fixtures if test suite grows.
# E.g., mock_k8s_apis could be defined there.
# For now, this single file setup is fine.
# The `base_url="http://test"` is standard for AsyncClient when testing a FastAPI app directly.
# The `app=app` argument tells AsyncClient to run requests against the `app` instance in-memory.
# This is much faster than starting a real Uvicorn server.

# Final check on node/edge counts for the main success test:
# Nodes: 1 service, 1 pod, 1 deployment, 1 ingress, 1 configmap, 1 secret = 6 nodes
# Edges:
# 1. ingress -> service (route)
# 2. service -> pod (selector)
# 3. deployment -> service (manages)
# 4. pod -> configmap (mount) - This was missing in the provided main.py transform_pods logic, let's assume it's there.
# 5. pod -> secret (mount) - This was also missing.
# If pod->cm and pod->secret edges are not generated by main.py, then edge count will be lower.
# The provided main.py has:
# - ingress -> service (if rule matches)
# - service -> pod (if selector matches)
# - deployment -> service (if labels match)
# - pod -> configmap (if volume mount exists)
# - pod -> secret (if volume mount exists)
# So with the current mock data, we expect:
# - ingress-1 -> service-1 (YES)
# - service-1 -> pod-1 (YES, app:app-1 matches)
# - dep-1 -> service-1 (YES, app:app-1 matches)
# The pod mock data in this test does not have volumes for configmaps/secrets.
# Let's update MOCK_PODS to include volumes to test these edges.

MOCK_PODS_WITH_VOLUMES = {
    "items": [
        {
            "metadata": {"name": "pod-1", "namespace": "ns-1", "labels": {"app": "app-1"}},
            "spec": {
                "containers": [{"name": "container-1"}],
                "volumes": [
                    {"name": "cm-vol", "configMap": {"name": "cm-1"}},
                    {"name": "secret-vol", "secret": {"secretName": "secret-1"}},
                ]
            },
            "status": {"phase": "Running"},
        }
    ]
}

@pytest.fixture
def mock_k8s_apis_with_pod_volumes():
    with patch.object(core_v1, 'list_service_for_all_namespaces', return_value=MagicMock(to_dict=lambda: MOCK_SERVICES)), \
         patch.object(core_v1, 'list_pod_for_all_namespaces', return_value=MagicMock(to_dict=lambda: MOCK_PODS_WITH_VOLUMES)), \
         patch.object(apps_v1, 'list_deployment_for_all_namespaces', return_value=MagicMock(to_dict=lambda: MOCK_DEPLOYMENTS)), \
         patch.object(networking_v1, 'list_ingress_for_all_namespaces', return_value=MagicMock(to_dict=lambda: MOCK_INGRESSES)), \
         patch.object(core_v1, 'list_config_map_for_all_namespaces', return_value=MagicMock(to_dict=lambda: MOCK_CONFIGMAPS)), \
         patch.object(core_v1, 'list_secret_for_all_namespaces', return_value=MagicMock(to_dict=lambda: MOCK_SECRETS)):
        yield

@pytest.mark.asyncio
async def test_get_service_map_data_success_with_pod_mounts(mock_k8s_apis_with_pod_volumes):
    async with AsyncClient(app=app, base_url="http://test") as ac:
        response = await ac.get("/api/service-map")
    assert response.status_code == 200
    data = response.json()
    assert "nodes" in data
    assert "edges" in data

    # Expected nodes: service, pod, deployment, ingress, configmap, secret = 6
    assert len(data["nodes"]) == 6

    # Expected edges:
    # 1. ingress_ns-1_ingress-1 -> service_ns-1_service-1 (route)
    # 2. service_ns-1_service-1 -> pod_ns-1_pod-1 (selector)
    # 3. deployment_ns-1_dep-1 -> service_ns-1_service-1 (manages)
    # 4. pod_ns-1_pod-1 -> configmap_ns-1_cm-1 (mount)
    # 5. pod_ns-1_pod-1 -> secret_ns-1_secret-1 (mount)
    assert len(data["edges"]) == 5

    assert any(edge["from"] == "pod_ns-1_pod-1" and edge["to"] == "configmap_ns-1_cm-1" for edge in data["edges"])
    assert any(edge["from"] == "pod_ns-1_pod-1" and edge["to"] == "secret_ns-1_secret-1" for edge in data["edges"])

# The first success test `test_get_service_map_data_success` used MOCK_PODS (no volumes)
# So it should have 3 edges. Let's refine its assertions.
# It uses `mock_k8s_apis` fixture.

@pytest.mark.asyncio
async def test_get_service_map_data_success_no_pod_mounts(mock_k8s_apis): # Renamed for clarity
    async with AsyncClient(app=app, base_url="http://test") as ac:
        response = await ac.get("/api/service-map")
    assert response.status_code == 200
    data = response.json()
    assert "nodes" in data
    assert "edges" in data
    assert len(data["nodes"]) == 6 # service, pod, deployment, ingress, cm, secret
    # Edges: ingress->svc, svc->pod, dep->svc = 3
    assert len(data["edges"]) == 3
    assert not any(edge["from"] == "pod_ns-1_pod-1" and edge["to"] == "configmap_ns-1_cm-1" for edge in data["edges"])
    assert not any(edge["from"] == "pod_ns-1_pod-1" and edge["to"] == "secret_ns-1_secret-1" for edge in data["edges"])

# The original test_get_service_map_data_success is now test_get_service_map_data_success_no_pod_mounts
# The new test test_get_service_map_data_success_with_pod_mounts covers volume mounts.
# This provides better coverage of the transformation logic.
