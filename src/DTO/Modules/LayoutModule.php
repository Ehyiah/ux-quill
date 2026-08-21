<?php

namespace Ehyiah\QuillJsBundle\DTO\Modules;

final class LayoutModule implements ModuleInterface
{
    public const NAME = 'layout';

    public string $name;

    /** @var array<string, mixed> */
    public array $options;

    public function __construct(
        string $name = self::NAME,
        array $options = [],
    ) {
        $this->name = $name;
        $this->options = array_merge($this->getDefaultOptions(), $options);
    }

    /**
     * @return array<string, mixed>
     */
    private function getDefaultOptions(): array
    {
        return [
            'presets' => [
                ['cols' => 2, 'ratios' => ['1fr', '1fr'],        'label' => '50/50'],
                ['cols' => 2, 'ratios' => ['1fr', '2fr'],        'label' => '30/70'],
                ['cols' => 2, 'ratios' => ['2fr', '1fr'],        'label' => '70/30'],
                ['cols' => 3, 'ratios' => ['1fr', '1fr', '1fr'], 'label' => '3 columns'],
            ],
            'allow_wrap' => true,
        ];
    }
}
