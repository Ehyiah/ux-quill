<?php

namespace Ehyiah\QuillJsBundle\Twig;

use Ehyiah\QuillJsBundle\DTO\Options\ThemeOption;
use Symfony\Component\AssetMapper\AssetMapperInterface;
use Twig\Extension\AbstractExtension;
use Twig\TwigFunction;

final class QuillContentExtension extends AbstractExtension
{
    /** @var array<string, true> */
    private array $emitted = [];

    public function __construct(
        private readonly ?AssetMapperInterface $assetMapper = null,
    ) {
    }

    public function getFunctions(): array
    {
        return [
            new TwigFunction(
                'quill_content_styles',
                $this->renderStyles(...),
                ['is_safe' => ['html']]
            ),
        ];
    }

    /**
     * Emits the <link> tags required to render Quill content.
     *
     * @param string $theme the Quill theme stylesheet to load (snow or bubble)
     * @param bool $cosmetic If true, also load the opinionated cosmetic stylesheet (e.g. mentions colors).
     */
    public function renderStyles(string $theme = ThemeOption::QUILL_THEME_SNOW, bool $cosmetic = false): string
    {
        if (null === $this->assetMapper) {
            return '';
        }

        $links = [];

        $themeAsset = sprintf('quill/dist/quill.%s.css', $theme);
        if ($this->shouldEmit($themeAsset) && null !== $url = $this->assetMapper->getPublicPath($themeAsset)) {
            $links[] = $this->link($url);
        }

        $structural = '@ehyiah/ux-quill/dist/styles/quill-content.css';
        if ($this->shouldEmit($structural) && null !== $url = $this->assetMapper->getPublicPath($structural)) {
            $links[] = $this->link($url);
        }

        if ($cosmetic) {
            $themeStyles = '@ehyiah/ux-quill/dist/styles/quill-content-theme.css';
            if ($this->shouldEmit($themeStyles) && null !== $url = $this->assetMapper->getPublicPath($themeStyles)) {
                $links[] = $this->link($url);
            }
        }

        return implode("\n", $links);
    }

    private function shouldEmit(string $asset): bool
    {
        if (isset($this->emitted[$asset])) {
            return false;
        }
        $this->emitted[$asset] = true;

        return true;
    }

    private function link(string $url): string
    {
        return sprintf('<link rel="stylesheet" href="%s">', htmlspecialchars($url, ENT_QUOTES));
    }
}
