<?php

namespace Ehyiah\QuillJsBundle\DTO\Modules;

/**
 * Interface used if you need to register a custom module
 *
 * OPTIONS can be the options needed by the modules
 *
 * NAME must be the module name, it will be used to register the module in the quill editor instance
 */
interface ModuleInterface
{
    /**
     * @param array<mixed>|int|string $options
     */
    public function __construct(array|int|string $options, string $name);
}
