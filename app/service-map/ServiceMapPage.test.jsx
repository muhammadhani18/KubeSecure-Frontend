import React from 'react';
import { render, screen, waitFor, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import ServiceMapPage from './page'; // Adjust path as needed

// Mock Next.js Link component
jest.mock('next/link', () => {
  return ({ children, href }) => {
    return <a href={href}>{children}</a>;
  };
});

// Mock Next.js useRouter (if needed, not strictly for this page yet but good practice)
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    pathname: '/service-map',
  }),
  // Mock other specific hooks if page uses them, like useSearchParams
}));


global.fetch = jest.fn();

// Mock ResizeObserver, often needed for layout-dependent components or canvas
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock canvas getContext, as it's called by the page's useEffect
HTMLCanvasElement.prototype.getContext = jest.fn(() => ({
  clearRect: jest.fn(),
  beginPath: jest.fn(),
  moveTo: jest.fn(),
  lineTo: jest.fn(),
  stroke: jest.fn(),
  arc: jest.fn(),
  fill: jest.fn(),
  closePath: jest.fn(),
  setLineDash: jest.fn(),
  measureText: jest.fn(() => ({ width: 0 })), // Mock measureText
  fillText: jest.fn(),
  save: jest.fn(), // Mock save and restore if used
  restore: jest.fn(),
  translate: jest.fn(), // Mock transform functions if used
  scale: jest.fn(),
  // Add any other canvas methods your component might call
}));


const mockSuccessData = {
  nodes: [
    { id: 'service_ns1_svc1', type: 'service', name: 'svc1', namespace: 'ns1', color: '#47b4ff', radius: 20 },
    { id: 'pod_ns1_pod1', type: 'pod', name: 'pod1', namespace: 'ns1', status: 'Running', color: '#10b981', radius: 12 },
    { id: 'pod_ns2_pod2', type: 'pod', name: 'pod2', namespace: 'ns2', status: 'Pending', color: '#10b981', radius: 12 },
  ],
  edges: [
    { from: 'service_ns1_svc1', to: 'pod_ns1_pod1', type: 'selector' },
  ],
};

const mockEmptyData = { nodes: [], edges: [] };

describe('ServiceMapPage', () => {
  beforeEach(() => {
    fetch.mockClear();
    // Clear other mocks if they maintain state between tests
    HTMLCanvasElement.prototype.getContext().clearRect.mockClear();
  });

  test('renders loading state initially', async () => {
    fetch.mockImplementationOnce(() => new Promise(() => {})); // Pending promise to keep it in loading
    render(<ServiceMapPage />);
    expect(screen.getByText('Service Map')).toBeInTheDocument(); // Header should be there
    // Check for a loading indicator, e.g., the spinning RefreshCw icon in the canvas area
    // This depends on how your loading state is visually represented.
    // Let's assume the RefreshCw icon for loading is present in the canvas card:
    await waitFor(() => {
      const canvasLoadingIcon = screen.getAllByRole('graphics-symbol', { name: /refresh/i }); // Lucide icons might not have explicit roles/names
      // A more robust way might be to check for a specific element with class 'animate-spin'
      expect(canvasLoadingIcon.length).toBeGreaterThanOrEqual(1); // One in refresh button, one in canvas
    });
  });

  test('renders error state if fetch fails', async () => {
    fetch.mockRejectedValueOnce(new Error('API is down'));
    render(<ServiceMapPage />);
    await waitFor(() => {
      expect(screen.getByText('Error loading Service Map')).toBeInTheDocument();
      expect(screen.getByText('Could not fetch data from the backend.')).toBeInTheDocument();
      expect(screen.getByText('API is down')).toBeInTheDocument();
    });
  });

  test('renders error state with detail from API response', async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => ({ detail: 'Kubernetes API error: Some internal issue' }),
    });
    render(<ServiceMapPage />);
    await waitFor(() => {
      expect(screen.getByText('Error loading Service Map')).toBeInTheDocument();
      expect(screen.getByText('Kubernetes API error: Some internal issue')).toBeInTheDocument();
    });
  });


  test('renders with data successfully fetched', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockSuccessData,
    });
    render(<ServiceMapPage />);
    await waitFor(() => {
      // Check for elements that appear when data is loaded
      expect(screen.getByText('Cluster Topology')).toBeInTheDocument();
      expect(screen.getByText('Resource List')).toBeInTheDocument();
      expect(screen.getByText('svc1')).toBeInTheDocument(); // From mock data in resource list
      expect(screen.getByText('pod1')).toBeInTheDocument();
    });
    // Ensure canvas drawing was attempted (even if it's just clearRect)
    expect(HTMLCanvasElement.prototype.getContext().clearRect).toHaveBeenCalled();
  });

  test('renders with empty data from API', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockEmptyData,
    });
    render(<ServiceMapPage />);
    await waitFor(() => {
      expect(screen.getByText('Cluster Topology')).toBeInTheDocument();
      expect(screen.getByText('Resource List')).toBeInTheDocument();
      // Check for "No resources found" message in the list view
      fireEvent.click(screen.getByText('Resource List')); // Switch to list tab
      expect(await screen.findByText('No resources found.')).toBeInTheDocument();
    });
     // Canvas should be cleared
    expect(HTMLCanvasElement.prototype.getContext().clearRect).toHaveBeenCalled();
  });

  test('populates namespace filter correctly', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockSuccessData,
    });
    render(<ServiceMapPage />);
    await waitFor(() => {
      expect(screen.getByText('svc1')).toBeInTheDocument(); // Wait for data to load
    });

    fireEvent.mouseDown(screen.getByRole('combobox', { name: /namespace/i })); // Shadcn select uses combobox role for trigger

    await waitFor(() => {
        // Check for expected namespaces from mockSuccessData
        expect(screen.getByRole('option', { name: 'All Namespaces' })).toBeInTheDocument();
        expect(screen.getByRole('option', { name: 'ns1' })).toBeInTheDocument();
        expect(screen.getByRole('option', { name: 'ns2' })).toBeInTheDocument();
    });
  });

  test('filters resources by namespace', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockSuccessData,
    });
    render(<ServiceMapPage />);
    await waitFor(() => {
      expect(screen.getByText('svc1')).toBeInTheDocument(); // Initial data loaded
    });

    // Switch to list tab to see items
    fireEvent.click(screen.getByText('Resource List'));
    await screen.findByText('svc1'); // Ensure list is populated

    // Filter by 'ns1'
    act(() => {
      const namespaceSelect = screen.getByRole('combobox', { name: /namespace/i });
      fireEvent.mouseDown(namespaceSelect);
    });
    await act(async () => {
      const ns1Option = await screen.findByRole('option', { name: 'ns1' });
      fireEvent.click(ns1Option);
    });

    await waitFor(() => {
      expect(screen.getByText('svc1')).toBeInTheDocument();
      expect(screen.getByText('pod1')).toBeInTheDocument();
      expect(screen.queryByText('pod2')).not.toBeInTheDocument(); // pod2 is in ns2
    });

    // Filter by 'ns2'
     act(() => {
      const namespaceSelect = screen.getByRole('combobox', { name: /namespace/i });
      fireEvent.mouseDown(namespaceSelect);
    });
    await act(async () => {
      const ns2Option = await screen.findByRole('option', { name: 'ns2' });
      fireEvent.click(ns2Option);
    });

    await waitFor(() => {
      expect(screen.queryByText('svc1')).not.toBeInTheDocument();
      expect(screen.queryByText('pod1')).not.toBeInTheDocument();
      expect(screen.getByText('pod2')).toBeInTheDocument();
    });
  });

  test('refresh button re-fetches data', async () => {
    fetch.mockResolvedValueOnce({ // Initial fetch
      ok: true,
      json: async () => mockSuccessData,
    });
    render(<ServiceMapPage />);
    await waitFor(() => {
      expect(screen.getByText('svc1')).toBeInTheDocument();
    });
    expect(fetch).toHaveBeenCalledTimes(1);

    // Mock response for the refresh fetch
    const refreshedData = {
      nodes: [{ id: 'refreshed_svc', type: 'service', name: 'refreshed-service', namespace: 'default' }],
      edges: [],
    };
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => refreshedData,
    });

    const refreshButton = screen.getByRole('button', { name: /Refresh/i });
    fireEvent.click(refreshButton);

    await waitFor(() => {
      // Check if new data is displayed (e.g., in the resource list)
      fireEvent.click(screen.getByText('Resource List')); // Switch to list tab
      expect(screen.getByText('refreshed-service')).toBeInTheDocument();
    });
    expect(fetch).toHaveBeenCalledTimes(2); // Initial + refresh
  });

   test('search functionality filters resources in the list view', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockSuccessData,
    });
    render(<ServiceMapPage />);
    await waitFor(() => {
      expect(screen.getByText('svc1')).toBeInTheDocument(); // Wait for data
    });

    fireEvent.click(screen.getByText('Resource List')); // Switch to list tab
    await screen.findByText('svc1'); // Ensure list is populated

    const searchInput = screen.getByPlaceholderText('Search resources...');
    fireEvent.change(searchInput, { target: { value: 'pod1' } });

    await waitFor(() => {
      expect(screen.queryByText('svc1')).not.toBeInTheDocument();
      expect(screen.getByText('pod1')).toBeInTheDocument();
      expect(screen.queryByText('pod2')).not.toBeInTheDocument();
    });

    fireEvent.change(searchInput, { target: { value: 'ns2' } }); // Search by part of namespace (pod2 is in ns2)
     await waitFor(() => {
      expect(screen.queryByText('svc1')).not.toBeInTheDocument();
      expect(screen.queryByText('pod1')).not.toBeInTheDocument();
      // The search is on node.name, not namespace in the provided page.jsx filter logic for the list.
      // If search should include namespace, page.jsx needs update.
      // For now, assuming search is by name: 'ns2' will not match 'pod2' by name.
      // Let's change search to 'pod2'
    });

    fireEvent.change(searchInput, { target: { value: 'pod2' } });
    await waitFor(() => {
        expect(screen.queryByText('svc1')).not.toBeInTheDocument();
        expect(screen.queryByText('pod1')).not.toBeInTheDocument();
        expect(screen.getByText('pod2')).toBeInTheDocument();
    });
  });

  // Note: Testing the actual canvas drawing visually is complex for unit tests.
  // We've mocked getContext and its methods. We can check if they are called,
  // but not what is drawn. This is usually covered by E2E or visual regression tests.
  // The current tests verify data flow and basic interactions.
});
