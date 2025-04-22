import axios, { AxiosResponse } from 'axios';

type UploadFunction = (uploadEndpoint: string, file: File) => Promise<AxiosResponse>;

export const uploadStrategies: Record<string, UploadFunction> = {
    'form': uploadFileForm,
    'json': uploadFileJson
};

export function uploadFileForm(uploadEndpoint: string, file: File): Promise<AxiosResponse> {
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

export function uploadFileJson(uploadEndpoint: string, file: File): Promise<AxiosResponse> {
    return new Promise((resolve, reject) => {
        const reader = (file: File): Promise<string | ArrayBuffer | null> => {
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

export function handleUploadResponse(response: AxiosResponse, jsonResponseFilePath?: string | null): Promise<string> {
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
            } catch (error: unknown) {
                console.error(error);
                if (error instanceof Error) {
                    reject(`Error while processing upload response: ${error.message}`);
                } else {
                    reject('Unknown error while processing upload response');
                }
            }
        } else {
            const result = typeof response.data === 'string' ?
                response.data :
                JSON.stringify(response.data);

            resolve(result);
        }
    });
}
