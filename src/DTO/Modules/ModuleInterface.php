<?php

namespace Ehyiah\QuillJsBundle\DTO\Modules;

/**
 * Interface used if you need to register a custom module
 *
 * NAME must be the module name, it will be used to register the module in the quill editor instance
 *
 * OPTIONS can be the options needed by the modules
 */
interface ModuleInterface
{
    /**
     * @param array<mixed> $options
     */
    public function __construct(string $name, array $options);
}
