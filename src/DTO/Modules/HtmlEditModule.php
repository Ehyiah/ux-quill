<?php

namespace Ehyiah\QuillJsBundle\DTO\Modules;

/**
 * For more options see https://github.com/benwinding/quill-html-edit-button
 */
final class HtmlEditModule implements ModuleInterface
{
    public const NAME = 'htmlEditButton';

    public const DEBUG_OPTION = 'debug';
    public const MESSAGE_OPTION = 'msg';
    public const OK_TEXT_OPTION = 'okText';
    public const CANCEL_TEXT_OPTION = 'cancelText';
    public const BUTTON_HTML_OPTION = 'buttonHTML';
    public const BUTTON_TITLE_OPTION = 'buttonTitle';
    public const CLOSE_ON_CLICK_OVERLAY_OPTION = 'closeOnClickOverlay';
    // default will append the editor in the body
    public const PREPREND_SELECTOR_OPTION = 'prependSelector';
    // Require Highlight, auto-registered but currently not really working well, waiting for PR in the module
    public const SYNTAX_OPTION = 'syntax';

    public function __construct(
        /**
         * @var array<mixed>|int|string
         */
        public $options = [
            self::DEBUG_OPTION => false,
            self::SYNTAX_OPTION => false,
            self::CLOSE_ON_CLICK_OVERLAY_OPTION => false,
            self::BUTTON_HTML_OPTION => '&lt;&gt;',
            self::BUTTON_TITLE_OPTION => 'Html source',
            self::MESSAGE_OPTION => 'Edit html source',
            self::OK_TEXT_OPTION => 'Save',
            self::CANCEL_TEXT_OPTION => 'Cancel',
        ],
        public string $name = self::NAME,
    ) {
    }
}
