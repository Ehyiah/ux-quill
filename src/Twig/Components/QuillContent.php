<?php

namespace Ehyiah\QuillJsBundle\Twig\Components;

use Ehyiah\QuillJsBundle\DTO\Options\StyleOption;
use Ehyiah\QuillJsBundle\DTO\Options\ThemeOption;
use Symfony\UX\TwigComponent\Attribute\AsTwigComponent;

#[AsTwigComponent(name: 'QuillContent', template: '@QuillJs/components/QuillContent.html.twig')]
final class QuillContent
{
    public string $value = '';
    public string $tag = 'div';
    public string $style = StyleOption::QUILL_STYLE_CLASS;
    public string $theme = ThemeOption::QUILL_THEME_SNOW;

    public function isClassStyle(): bool
    {
        return StyleOption::QUILL_STYLE_CLASS === $this->style;
    }
}
