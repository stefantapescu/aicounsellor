import { fetchOnetData, getOnetAbout } from './onet';

// Mock fetch globally
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('O*NET API Integration', () => {
  const mockApiKey = '20jrL-Mg4AY-zDZ5C-R7xRp';

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    // Set up environment
    process.env.ONET_API_KEY = mockApiKey;
  });

  afterEach(() => {
    // Clean up environment
    delete process.env.ONET_API_KEY;
  });

  it('should successfully fetch data from O*NET API', async () => {
    const mockResponse = {
      status: 'success',
      data: { test: 'data' },
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    });

    const result = await getOnetAbout();
    expect(result).toEqual(mockResponse.data);
    expect(mockFetch).toHaveBeenCalledWith(
      'https://api-v2.onetcenter.org/about',
      expect.objectContaining({
        headers: expect.objectContaining({
          'X-API-Key': mockApiKey,
          'Content-Type': 'application/json',
        }),
      })
    );
  });

  it('should throw error when API key is not configured', async () => {
    // Remove the API key
    delete process.env.ONET_API_KEY;

    await expect(getOnetAbout()).rejects.toThrow('O*NET API key is not configured');
  });

  it('should throw error when API request fails', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      statusText: 'Not Found',
    });

    await expect(getOnetAbout()).rejects.toThrow('O*NET API error: Not Found');
  });
}); 