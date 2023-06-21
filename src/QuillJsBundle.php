<?php

namespace Ehyiah\QuillJs;

use Symfony\Component\HttpKernel\Bundle\AbstractBundle;

// More details on https://symfony.com/doc/current/bundles/configuration.html#using-the-abstractbundle-class
class QuillJsBundle extends AbstractBundle
{
    public function getPath(): string
    {
        return \dirname(__DIR__);
    }
}
