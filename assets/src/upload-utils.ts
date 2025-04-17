import axios from 'axios';

export const uploadStrategies = {
    'form': uploadFileForm,
    'json': uploadFileJson
};

export function uploadFileForm(uploadEndpoint, file) {
    return new Promise((resolve, reject) => {
        const formData = new FormData();
        formData.append('file', file);

        axios
            .post(uploadEndpoint, formData)
            .then(response => resolve(response))
            .catch(err => {
                console.error(err);
                reject('Upload failed');
            });
    });
}

export function uploadFileJson(uploadEndpoint, file) {
    return new Promise((resolve, reject) => {
        const reader = (file) => {
            return new Promise((resolve) => {
                const fileReader = new FileReader();
                fileReader.onload = () => resolve(fileReader.result);
                fileReader.readAsDataURL(file);
            });
        };

        reader(file)
            .then(result =>
                axios
                    .post(uploadEndpoint, result, {
                        headers: {
                            'Content-Type': 'application/json',
                        }
                    })
                    .then(response => resolve(response))
                    .catch(err => {
                        console.error(err);
                        reject('Upload failed');
                    })
            );
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
                resolve(result);
            } catch (error) {
                console.error(error);
                reject(`Error while processing upload response: ${error.message}`);
            }
        } else {
            resolve(response.data);
        }
    });
}
