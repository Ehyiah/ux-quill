import axios from 'axios';
export const uploadStrategies = {
  'form': uploadFileForm,
  'json': uploadFileJson
};
function applyAuthConfig(config, authConfig) {
  if (!authConfig) {
    return config;
  }
  const newConfig = {
    ...config
  };
  if (!newConfig.headers) {
    newConfig.headers = {};
  }
  switch (authConfig.type) {
    case 'jwt':
      if (authConfig.jwt_token) {
        newConfig.headers['Authorization'] = `Bearer ${authConfig.jwt_token}`;
      } else {
        console.error('JWT auth configured but no token provided');
      }
      break;
    case 'basic':
      if (authConfig.username && authConfig.password) {
        const credentials = `${authConfig.username}:${authConfig.password}`;
        const encoded = typeof btoa === 'function' ? btoa(credentials) : Buffer.from(credentials).toString('base64');
        newConfig.headers['Authorization'] = `Basic ${encoded}`;
      } else {
        console.error('Basic auth configured but missing credentials');
      }
      break;
    case 'custom_header':
      if (authConfig.custom_header_value) {
        newConfig.headers[authConfig.custom_header] = authConfig.custom_header_value;
      } else {
        console.error('custom_header auth configured but no custom_header_value provided');
      }
      break;
  }
  return newConfig;
}
export function uploadFileForm(uploadEndpoint, file, authConfig) {
  return new Promise((resolve, reject) => {
    const formData = new FormData();
    formData.append('file', file);
    const config = applyAuthConfig({}, authConfig);
    axios.post(uploadEndpoint, formData, config).then(response => resolve(response)).catch(err => {
      console.error(err);
      reject('Upload failed');
    });
  });
}
export function uploadFileJson(uploadEndpoint, file, authConfig) {
  return new Promise((resolve, reject) => {
    const reader = file => {
      return new Promise(resolve => {
        const fileReader = new FileReader();
        fileReader.onload = () => resolve(fileReader.result);
        fileReader.readAsDataURL(file);
      });
    };
    reader(file).then(result => {
      const config = applyAuthConfig({
        headers: {
          'Content-Type': 'application/json'
        }
      }, authConfig);
      return axios.post(uploadEndpoint, result, config).then(response => resolve(response)).catch(err => {
        console.error(err);
        reject('Upload failed');
      });
    });
  });
}
export function handleUploadResponse(response, jsonResponseFilePath) {
  return new Promise((resolve, reject) => {
    const contentType = response.headers['content-type'] || '';
    if (contentType.includes('application/json') && jsonResponseFilePath) {
      const pathParts = jsonResponseFilePath.split('.');
      let result = response.data;
      try {
        for (const part of pathParts) {
          if (result && typeof result === 'object' && part in result) {
            result = result[part];
          } else {
            throw new Error(`Invalid json path for response: '${jsonResponseFilePath}'. Property '${part}' not found.`);
          }
        }
        if (typeof result !== 'string') {
          result = String(result);
        }
        resolve(result);
      } catch (error) {
        console.error(error);
        if (error instanceof Error) {
          reject(`Error while processing upload response: ${error.message}`);
        } else {
          reject('Unknown error while processing upload response');
        }
      }
    } else {
      const result = typeof response.data === 'string' ? response.data : JSON.stringify(response.data);
      resolve(result);
    }
  });
}