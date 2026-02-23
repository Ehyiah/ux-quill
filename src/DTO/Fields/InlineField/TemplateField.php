<?php

namespace Ehyiah\QuillJsBundle\DTO\Fields\InlineField;

use Ehyiah\QuillJsBundle\DTO\Fields\Interfaces\QuillBlockFieldInterface;
use Ehyiah\QuillJsBundle\DTO\Fields\Interfaces\QuillFieldModuleInterface;
use Ehyiah\QuillJsBundle\DTO\Modules\TemplatesModule;

final class TemplateField implements QuillBlockFieldInterface, QuillFieldModuleInterface
{
    /**
     * @param string|null $icon SVG string to use as the toolbar button icon (null = default icon)
     */
    public function __construct(private readonly ?string $icon = null)
    {
    }

    public function getOption(): array
    {
        return ['template' => $this->icon ?? true];
    }

    public static function importModules(): array
    {
        return [TemplatesModule::class];
    }
}
