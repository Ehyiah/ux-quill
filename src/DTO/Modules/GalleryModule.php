<?php

namespace Ehyiah\QuillJsBundle\DTO\Modules;

use InvalidArgumentException;

class GalleryModule implements ModuleInterface
{
    public const NAME = 'mediaGallery';

    public const BUTTON_TITLE_OPTION = 'buttonTitle';
    public const BUTTON_UPLOAD_OPTION = 'uploadTitle';
    public const ICON_OPTION = 'icon';

    public const MESSAGE_LOADING_OPTION = 'messageLoadingOption';
    public const MESSAGE_ERROR_OPTION = 'messageErrorOption';
    public const MESSAGE_NO_IMAGE_OPTION = 'messageNoImageOption';
    public const MESSAGE_NEXT_PAGE_OPTION = 'messageNextPageOption';
    public const MESSAGE_PREV_PAGE_OPTION = 'messagePrevPageOption';
    public const MESSAGE_SEARCH_PLACEHOLDER_OPTION = 'messageSearchPlaceholderOption';

    // endpoint to list images
    public const LIST_ENDPOINT_OPTION = 'listEndpoint';
    // endpoint to search images
    public const SEARCH_ENDPOINT_OPTION = 'searchEndpoint';

    // use these to override default configuration in quill_extra_options['upload_handler']
    public const AUTH_CONFIG_OPTION = 'authConfig';
    public const UPLOAD_ENDPOINT_OPTION = 'uploadEndpoint';
    public const UPLOAD_STRATEGY_OPTION = 'uploadStrategy'; // either json || form
    public const JSON_RESPONSE_FILE_PATH_OPTION = 'jsonResponseFilePath';

    /**
     * @var array<string, string|bool|null>
     */
    public array $options;

    /**
     * @param array<string, string|bool|null> $options
     */
    public function __construct(
        public string $name = self::NAME,
        array $options = [],
    ) {
        $this->options = array_merge($this->getDefaultOptions(), $options);

        if (empty($this->options[self::LIST_ENDPOINT_OPTION])) {
            throw new InvalidArgumentException(sprintf('The option "%s" is mandatory for module "%s".', self::LIST_ENDPOINT_OPTION, self::NAME));
        }
    }

    /**
     * @return array<string, string|bool|null>
     */
    private function getDefaultOptions(): array
    {
        return [
            self::UPLOAD_ENDPOINT_OPTION => '',
            self::LIST_ENDPOINT_OPTION => '',
            self::SEARCH_ENDPOINT_OPTION => '',
            self::UPLOAD_STRATEGY_OPTION => '',
            self::AUTH_CONFIG_OPTION => null,
            self::JSON_RESPONSE_FILE_PATH_OPTION => '',
            self::ICON_OPTION => '<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                    <rect x="3" y="4" width="18" height="16" rx="2" ry="2"
                          stroke="currentColor" stroke-width="2" fill="none"/>
                    <circle cx="8" cy="9" r="2" fill="currentColor"/>
                    <path d="M21 15l-5-5L5 21" stroke="currentColor" stroke-width="2" fill="none"/>
                /svg>',
            self::BUTTON_TITLE_OPTION => 'Open the media gallery',
            self::BUTTON_UPLOAD_OPTION => '⬆️ Upload',
            self::MESSAGE_LOADING_OPTION => 'Loading...',
            self::MESSAGE_NEXT_PAGE_OPTION => 'Next page > ',
            self::MESSAGE_PREV_PAGE_OPTION => '< Previous page',
            self::MESSAGE_ERROR_OPTION => 'Error',
            self::MESSAGE_NO_IMAGE_OPTION => 'No image',
            self::MESSAGE_SEARCH_PLACEHOLDER_OPTION => 'Search...',
        ];
    }
}
