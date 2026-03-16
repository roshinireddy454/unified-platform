import { find } from 'linkifyjs';
import { useCallback, useEffect, useRef } from 'react';
import debounce from 'lodash.debounce';
import { useChannelStateContext, useChatContext } from '../../../context';
import { LinkPreviewState, SetLinkPreviewMode } from '../types';
export const useLinkPreviews = ({ debounceURLEnrichmentMs: debounceURLEnrichmentMsInputContext, dispatch, enrichURLForPreview = false, findURLFn: findURLFnInputContext, linkPreviews, onLinkPreviewDismissed: onLinkPreviewDismissedInputContext, }) => {
    const { client } = useChatContext();
    // FIXME: the value of channelConfig is stale due to omitting it from the memoization deps in useCreateChannelStateContext
    const { channelConfig, debounceURLEnrichmentMs: debounceURLEnrichmentMsChannelContext, findURLFn: findURLFnChannelContext, onLinkPreviewDismissed: onLinkPreviewDismissedChannelContext, } = useChannelStateContext();
    const shouldDiscardEnrichQueries = useRef(false);
    const findURLFn = findURLFnInputContext ?? findURLFnChannelContext;
    const onLinkPreviewDismissed = onLinkPreviewDismissedInputContext ?? onLinkPreviewDismissedChannelContext;
    const debounceURLEnrichmentMs = debounceURLEnrichmentMsInputContext ?? debounceURLEnrichmentMsChannelContext ?? 1500;
    const dismissLinkPreview = useCallback((linkPreview) => {
        onLinkPreviewDismissed?.(linkPreview);
        const previewToRemoveMap = new Map();
        linkPreview.state = LinkPreviewState.DISMISSED;
        previewToRemoveMap.set(linkPreview.og_scrape_url, linkPreview);
        dispatch({
            linkPreviews: previewToRemoveMap,
            mode: SetLinkPreviewMode.UPSERT,
            type: 'setLinkPreviews',
        });
    }, 
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [onLinkPreviewDismissed]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const findAndEnqueueURLsToEnrich = useCallback(debounce((text, mode = SetLinkPreviewMode.SET) => {
        const urls = findURLFn
            ? findURLFn(text)
            : find(text, 'url').reduce((acc, link) => {
                if (link.isLink)
                    acc.push(link.href);
                return acc;
            }, []);
        shouldDiscardEnrichQueries.current = urls.length === 0;
        dispatch({
            linkPreviews: urls.reduce((acc, url) => {
                acc.set(url, { og_scrape_url: url, state: LinkPreviewState.QUEUED });
                return acc;
            }, new Map()),
            mode,
            type: 'setLinkPreviews',
        });
    }, debounceURLEnrichmentMs, { leading: false, trailing: true }), [debounceURLEnrichmentMs, shouldDiscardEnrichQueries, findURLFn]);
    const cancelURLEnrichment = useCallback(() => {
        findAndEnqueueURLsToEnrich.cancel();
        findAndEnqueueURLsToEnrich('');
        findAndEnqueueURLsToEnrich.flush();
    }, [findAndEnqueueURLsToEnrich]);
    useEffect(() => {
        const enqueuedLinks = Array.from(linkPreviews.values()).reduce((acc, linkPreview) => {
            if (linkPreview.state === 'queued') {
                const loadingLinkPreview = {
                    ...linkPreview,
                    state: LinkPreviewState.LOADING,
                };
                acc.set(linkPreview.og_scrape_url, loadingLinkPreview);
            }
            return acc;
        }, new Map());
        if (!enqueuedLinks.size)
            return;
        dispatch({
            linkPreviews: enqueuedLinks,
            mode: SetLinkPreviewMode.UPSERT,
            type: 'setLinkPreviews',
        });
        enqueuedLinks.forEach((linkPreview) => {
            client
                .enrichURL(linkPreview.og_scrape_url)
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                .then(({ duration, ...ogAttachment }) => {
                if (shouldDiscardEnrichQueries.current)
                    return;
                const linkPreviewsMap = new Map();
                linkPreviewsMap.set(linkPreview.og_scrape_url, {
                    ...ogAttachment,
                    state: LinkPreviewState.LOADED,
                });
                dispatch({
                    linkPreviews: linkPreviewsMap,
                    mode: SetLinkPreviewMode.UPSERT,
                    type: 'setLinkPreviews',
                });
            })
                .catch(() => {
                const linkPreviewsMap = new Map();
                linkPreviewsMap.set(linkPreview.og_scrape_url, {
                    ...linkPreview,
                    state: LinkPreviewState.FAILED,
                });
                dispatch({
                    linkPreviews: linkPreviewsMap,
                    mode: SetLinkPreviewMode.UPSERT,
                    type: 'setLinkPreviews',
                });
            });
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [shouldDiscardEnrichQueries, linkPreviews]);
    return {
        cancelURLEnrichment,
        dismissLinkPreview,
        findAndEnqueueURLsToEnrich: channelConfig?.url_enrichment && enrichURLForPreview
            ? findAndEnqueueURLsToEnrich
            : undefined,
    };
};
