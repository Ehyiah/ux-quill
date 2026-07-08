<?php

namespace Ehyiah\QuillJsBundle\DTO\Modules;

/**
 * Module to display visible borders around each primary block in the editor,
 * helping users visualize the grid/layout structure.
 */
final class GridBordersModule implements ModuleInterface
{
    public const NAME = 'gridBorders';

    /**
     * @param array{
     *     active?: bool,
     *     borderColor?: string|null,
     *     borderWidth?: int,
     *     borderStyle?: string,
     *     toggleButton?: bool,
     * } $options
     */
    public function __construct(
        public string $name = self::NAME,
        public $options = [],
    ) {
        $this->options = array_merge([
            'active' => false,
            'borderColor' => null,
            'borderWidth' => 1,
            'borderStyle' => 'dashed',
            'toggleButton' => true,
        ], $this->options);
    }
}
