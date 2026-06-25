# Image Upload Handling

In ***ImageField***: QuillJS transforms images in a base64 encoded file by default to save your files.
However, you can specify a custom endpoint to handle image uploading and pass in response the entire public URL to display the image.

## Currently handling 2 methods

### 1: Data sending in ``base64`` inside a ``application/json`` request

In JSON mode data will look like this by calling ``$request->getContent()`` and ```application/json``` in content-type headers:

```
"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAlgAAAJYCAQAAAAUb1BXAAAABGdBTUEAALGPC/xhBQAAACyygyyioiBqFCUIKC64x..."
```

### 2: Sending in a ``multipart/form-data`` request

In form mode you will find a ```multipart/form-data``` in content-type headers and file will be present in $request->files named ```file``` as a ``Symfony\Component\HttpFoundation\File\UploadedFile``.
Then you can handle it like you would do with a FileType and access the file like this:

```php
/** @var \Symfony\Component\HttpFoundation\Request $request */
/** @var \Symfony\Component\HttpFoundation\File\UploadedFile $file */
$file = $request->files->get('file'))
```

## Upload mode configuration

**Example of a JSON configuration to send a request to the upload endpoint that returns a JSON response containing the URL to the uploaded image.**

```php
'quill_extra_options' => [
    'upload_handler' => [
        'type' => 'json',
        'upload_endpoint' => '/my-custom-endpoint/upload',
        'json_response_file_path' => 'file.url'
    ]
],
```

## Available options in upload handler

| upload_handler option name | type | default value | possible values |
| :---: | :---: | :--- | :--- |
| **type** | string | form | ``json``, ``form`` |
| **upload_endpoint** | string | null | the endpoint of your upload handler exemple : ``/upload`` or ``https://my-custom-upload-endpoint/upload`` |
| **json_response_file_path** | string | null | if you specify this option, that mean your upload endpoint will return you a json response. The value must be the path inside the json (this option will be ignored if the content type of the upload endpoint response is not application/json) |
| **security** | array | null | see below for available options |

## Upload endpoint security

| security options | type | used with | default values | possible values | explaination |
| :---: | :---: | :---: | :---: | :---: | :--- |
| **type** | string | | null | ``jwt``, ``basic``, ``custom_header`` | with ``jwt`` a header will be added in the post request ``'authorization' => 'Bearer MY_JWT_TOKEN'``, with ``basic`` a header will be added in the post request ``'authorization' => 'Basic YmFiYXI6cGFzcy1iYWJhcg=='`` with ``custom_header`` a header will be added in the post request ``'custom_header' => 'custom_header_value=='`` |
| **jwt_token** | string | jwt | null | | pass a valid JWT token for your upload endpoint (don't specify Bearer, it will be added automatically) |
| **username** | string | basic | null | | the username of your basic http user |
| **password** | string | basic | null | | the password of your basic http user |
| **custom_header** | string | custom_header | null | | the key used for your custom header |
| **custom_header_value** | string | custom_header | null | | the value that will be passed in your custom header |

**Example of a JSON configuration with jwt security.**

```php
'quill_extra_options' => [
    'upload_handler' => [
        'type' => 'json',
        'upload_endpoint' => '/my-custom-endpoint/upload',
        'json_response_file_path' => 'file.url',
        'security' => [
            'type' => 'jwt',
            'jwt_token' => 'my_jwt_token',
        ],
    ]
],
```

## Response Examples

- If your response in a classic simple ``Symfony\Component\HttpFoundation\Response``, you can simply return a response like this one for exemple and do **not** need to specify the ``json_response_file_path`` option.

```php
return new Response('https://my-website/public/assets/my-uploaded-image.jpg');
```

- If your response is a JSON response like a ``Symfony\Component\HttpFoundation\JsonResponse``, the ``json_response_file_path`` option can be used to specify the url inside the json response.
In the exemple below ``json_path_file_response`` must be ``'file.url'``.

```php
return new JsonResponse([
    'file' => [
        'url' => 'https://my-website/public/assets/my-uploaded-image.jpg',
    ]
]);
```

- If your response is a JSON response like a ``Symfony\Component\HttpFoundation\JsonResponse``, **and** the ``json_response_file_path`` is **null**.

```php
return new JsonResponse('https://my-website/public/assets/my-uploaded-image.jpg');
```
