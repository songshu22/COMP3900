const API_PATH = 'http://localhost:81';

// Helper function that wraps around fetch requests
// method: request method
// path: request path
// body: optional request body (POST/PUT etc)
// token: optional user authentication token
const apiFetch = async (method, path, body = null, token = null) => {
  // Set up the fetch request
  const requestOptions = {
    method: method,
    headers: {
      'Content-Type': 'application/json',
    },
    cache: 'no-cache',
  };

  // Append the request body
  if (body != null) {
    requestOptions.body = JSON.stringify(body);
  }

  // Append the request auth token
  if (token !== null) {
    requestOptions.headers.Authorization = `Bearer ${token}`;
  }

  try {
    // Attempt to make the fetch request async
    const response = await fetch(`${API_PATH}/${path}`, requestOptions);
    const data = await response.json();
    data.ok = true;

    // If 4XX error, set ok to false
    if (Object.prototype.hasOwnProperty.call(data, 'error')) {
      data.ok = false;
    }

    return data;
  } catch(err) {
    // If fetch error, insert error text
    console.error(err);
    return {ok: false, error: `Could not connect to server. 
      Is your internet connection ok?`};
  }
};

export default apiFetch;
