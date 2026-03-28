<?php

namespace Ehyiah\QuillJsBundle\Tests\DTO\Modules;

use Ehyiah\QuillJsBundle\DTO\Modules\AutosaveModule;
use Ehyiah\QuillJsBundle\DTO\Modules\DividerModule;
use Ehyiah\QuillJsBundle\DTO\Modules\LinkAttributesModule;
use Ehyiah\QuillJsBundle\DTO\Modules\MarkdownModule;
use Ehyiah\QuillJsBundle\DTO\Modules\MentionModule;
use Ehyiah\QuillJsBundle\DTO\Modules\PageBreakModule;
use Ehyiah\QuillJsBundle\DTO\Modules\PasteSanitizerModule;
use PHPUnit\Framework\TestCase;

/**
 * @coversNothing
 */
class ModulesDTOTest extends TestCase
{
    public function testPasteSanitizerModule(): void
    {
        $module = new PasteSanitizerModule();
        $this->assertEquals('pasteSanitizer', $module->name);
        $this->assertTrue($module->options['plain_text']);

        $module = new PasteSanitizerModule(options: ['plain_text' => false]);
        $this->assertFalse($module->options['plain_text']);
    }

    public function testAutosaveModule(): void
    {
        $module = new AutosaveModule();
        $this->assertEquals('autosave', $module->name);
        $this->assertEquals(2000, $module->options['interval']);
        $this->assertEquals('manual', $module->options['restore_type']);
        $this->assertEquals('An unsaved version of your text was found.', $module->options['notificationText']);
        $this->assertEquals('Restore', $module->options['restoreButtonLabel']);
        $this->assertEquals('Ignore', $module->options['ignoreButtonLabel']);

        $module = new AutosaveModule(options: [
            'interval' => 5000,
            'restore_type' => 'auto',
            'notificationText' => 'Un texte a été trouvé.',
            'restoreButtonLabel' => 'Restaurer',
            'ignoreButtonLabel' => 'Ignorer',
        ]);
        $this->assertEquals(5000, $module->options['interval']);
        $this->assertEquals('auto', $module->options['restore_type']);
        $this->assertEquals('Un texte a été trouvé.', $module->options['notificationText']);
        $this->assertEquals('Restaurer', $module->options['restoreButtonLabel']);
        $this->assertEquals('Ignorer', $module->options['ignoreButtonLabel']);
    }

    public function testDividerModule(): void
    {
        $module = new DividerModule();
        $this->assertEquals('divider', $module->name);
        $this->assertEquals([], $module->options);
    }

    public function testMarkdownModule(): void
    {
        $module = new MarkdownModule();
        $this->assertEquals('markdown', $module->name);
        $this->assertEquals([], $module->options);
    }

    public function testPageBreakModule(): void
    {
        $module = new PageBreakModule();
        $this->assertEquals('pageBreak', $module->name);
        $this->assertEquals(['label' => 'Page Break'], $module->options);

        $module = new PageBreakModule(options: ['label' => 'Saut de page']);
        $this->assertEquals(['label' => 'Saut de page'], $module->options);
    }

    public function testLinkAttributesModule(): void
    {
        $module = new LinkAttributesModule();
        $this->assertEquals('linkAttributes', $module->name);
        $this->assertEquals([], $module->options);
    }

    public function testMentionModule(): void
    {
        $module = new MentionModule();
        $this->assertEquals('mention', $module->name);
        $this->assertEquals('@', $module->options['trigger']);

        $module = new MentionModule('mention-tags', ['trigger' => '#']);
        $this->assertEquals('mention-tags', $module->name);
        $this->assertEquals('#', $module->options['trigger']);
        $this->assertEquals(10, $module->options['max_results']);
    }
}
