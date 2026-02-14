# Media gallery module details

## Configuration
Here is the list of some options for the media gallery module (see full available options in PHP class):

- **listEndpoint** : the endpoint to get the list of images from. This option is mandatory
  The response from your endpoint must be like this :
```json
{
   "data": [
      {
         "url": "https://picsum.photos/id/11/400/400",
         "thumbnail": "https://picsum.photos/id/11/200/200",
         "title": "Image #1"
      }
   ],
   "links": {
      "next": "/api/media/list?page=2",
      "prev": null
   }
}
```

- **searchEndpoint** : the endpoint to search images. If no url is provided, the search bar will not be displayed.
  The search term will be passed as a query parameter named `term`.
  The response format is the same as the list endpoint.
- **icon** : the icon to use in the toolbar pass a svg icon like others icons customization.

- **uploadEndpoint**, **uploadStrategy**, **authConfig**, **jsonResponseFilePath** :
  By default, these options **automatically inherit** from the global `upload_handler` configuration defined in `quill_extra_options`.
  However, you can override them specifically for the gallery module if needed.

- **uploadEndpoint** : the endpoint to upload an image. If no url is provided (globally or locally), the upload button will not be displayed.
- **uploadStrategy** : 'form' (default) or 'json'.


## example of a listing api endpoint for testing purpose
```php
<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;

#[Route('/api/media/gallery', name: 'api_media_')]
class GalleryController extends AbstractController
{
    #[Route('/list', name: 'api_media_list')]
    public function list(Request $request): JsonResponse
    {
        $page = $request->get('page', 1);
        $perPage = 10;
        $total = 30;

        $images = [];
        for ($i = 0; $i < $perPage; $i++) {
            $id = (($page - 1) * $perPage) + $i + 1;
            if ($id > $total) break;
            $images[] = [
                'url' => sprintf('https://picsum.photos/id/%d/400/400', 10 + $id),
                'thumbnail' => sprintf('https://picsum.photos/id/%d/200/200', 10 + $id),
                'title' => "Image #$id",
            ];
        }

        $baseUrl = '/api/media/gallery/list';
        $hasNext = ($page * $perPage) < $total;
        $hasPrev = $page > 1;

        return new JsonResponse([
            'data' => $images,
            'links' => [
            'next' => $hasNext ? "$baseUrl?page=" . ($page + 1) : null,
            'prev' => $hasPrev ? "$baseUrl?page=" . ($page - 1) : null,
            ],
        ]);
    }

    #[Route('/search', name: 'api_media_search')]
    public function search(Request $request): JsonResponse
    {
    // This is not actually making a research, but you will see that 5 pages are available instead of 3
        $term = $request->get('term', 1);
        $page = $request->get('page', 1);
        $perPage = 10;
        $total = 50;

        $images = [];
        for ($i = 0; $i < $perPage; $i++) {
            $id = (($page - 1) * $perPage) + $i + 1;
            if ($id > $total) break;
            $images[] = [
                'url' => sprintf('https://picsum.photos/id/%d/400/400', 10 + $id),
                'thumbnail' => sprintf('https://picsum.photos/id/%d/200/200', 10 + $id),
                'title' => "Image #$id",
            ];
        }

        $baseUrl = '/api/media/gallery/search?term=' . $term;
        $hasNext = ($page * $perPage) < $total;
        $hasPrev = $page > 1;

        return new JsonResponse([
            'data' => $images,
            'links' => [
                'next' => $hasNext ? "$baseUrl&page=" . ($page + 1) : null,
                'prev' => $hasPrev ? "$baseUrl&page=" . ($page - 1) : null,
            ],
        ]);
    }
}
```
