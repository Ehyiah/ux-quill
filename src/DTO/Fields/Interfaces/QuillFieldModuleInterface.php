<?php

namespace Ehyiah\QuillJsBundle\DTO\Fields\Interfaces;

use Ehyiah\QuillJsBundle\DTO\Modules\ModuleInterface;

interface QuillFieldModuleInterface
{
    /**
     * @return array<class-string<ModuleInterface>>
     */
    public static function importModules(): array;
}
