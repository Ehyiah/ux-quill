<?php

namespace Ehyiah\QuillJsBundle\Controller;

use Ehyiah\QuillJsBundle\DTO\Synonym\SynonymProviderRegistry;
use Ehyiah\QuillJsBundle\Event\Synonym\AfterSynonymSearchEvent;
use Ehyiah\QuillJsBundle\Event\Synonym\BeforeSynonymSearchEvent;
use RuntimeException;
use Symfony\Component\EventDispatcher\EventDispatcherInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpKernel\Attribute\AsController;
use Symfony\Component\Routing\Attribute\Route;
use Throwable;

#[AsController]
class SynonymController
{
    public function __construct(
        private readonly SynonymProviderRegistry $registry,
        private readonly EventDispatcherInterface $eventDispatcher,
    ) {
    }

    #[Route('/_ux/quill/synonyms', name: 'ux_quill_synonyms', methods: ['POST'])]
    public function __invoke(Request $request): JsonResponse
    {
        $payload = json_decode($request->getContent(), true);

        if (!is_array($payload)) {
            return $this->error('Invalid JSON payload.');
        }

        $provider = $payload['provider'] ?? null;
        $word = $payload['word'] ?? null;

        if (!is_string($provider) || '' === $provider) {
            return $this->error('Missing or invalid "provider".');
        }

        if (!is_string($word) || '' === $word) {
            return $this->error('Missing or invalid "word".');
        }

        if (!$this->registry->has($provider)) {
            return $this->error(sprintf('Unknown provider "%s".', $provider));
        }

        try {
            $providerInstance = $this->registry->get($provider);
        } catch (RuntimeException $e) {
            return $this->error($e->getMessage());
        }

        $providerOptions = $payload['providerOptions'] ?? [];
        if (!is_array($providerOptions)) {
            $providerOptions = [];
        }

        $providerInstance->configureOptions($providerOptions);

        try {
            $providerInstance->validate();
        } catch (RuntimeException $e) {
            return $this->error($e->getMessage());
        }

        $context = is_string($payload['context'] ?? null) ? $payload['context'] : null;
        $locale = is_string($payload['locale'] ?? null) ? $payload['locale'] : 'fr';

        $this->eventDispatcher->dispatch(new BeforeSynonymSearchEvent(
            provider: $provider,
            word: $word,
            context: $context,
            locale: $locale,
        ));

        try {
            $synonyms = $providerInstance->getSynonyms($word, $context, $locale);
        } catch (Throwable $e) {
            return $this->error($e->getMessage());
        }

        $this->eventDispatcher->dispatch(new AfterSynonymSearchEvent(
            provider: $provider,
            word: $word,
            context: $context,
            locale: $locale,
            results: $synonyms,
        ));

        $data = array_map(static fn ($s) => ['word' => $s->word, 'score' => $s->score], $synonyms);

        return new JsonResponse($data);
    }

    /**
     * @param array<string, mixed> $extra
     */
    private function error(string $message, array $extra = []): JsonResponse
    {
        return new JsonResponse(array_merge(['error' => $message], $extra), 400);
    }
}
