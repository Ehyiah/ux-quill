<?php

namespace Ehyiah\QuillJsBundle\DTO\Modules;

final class LinkAttributesModule implements ModuleInterface
{
    public const NAME = 'linkAttributes';

    /**
     * @param array{
     *     openInNewTabLabel?: string,
     *     noFollowLabel?: string,
     *     saveButtonLabel?: string,
     * } $options
     */
    public function __construct(
        public string $name = self::NAME,
        public $options = [],
    ) {
        $this->options = array_merge([
            'openInNewTabLabel' => 'Open in new tab',
            'noFollowLabel' => 'No follow (SEO)',
            'saveButtonLabel' => 'OK',
        ], $this->options);
    }
}
