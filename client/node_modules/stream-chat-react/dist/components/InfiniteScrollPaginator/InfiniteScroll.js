import React, { useEffect, useRef } from 'react';
import { deprecationAndReplacementWarning } from '../../utils/deprecationWarning';
import { DEFAULT_LOAD_PAGE_SCROLL_THRESHOLD } from '../../constants/limits';
/**
 * Prevents Chrome hangups
 * See: https://stackoverflow.com/questions/47524205/random-high-content-download-time-in-chrome/47684257#47684257
 */
const mousewheelListener = (event) => {
    if (event instanceof WheelEvent && event.deltaY === 1) {
        event.preventDefault();
    }
};
/**
 * This component serves a single purpose - load more items on scroll inside the MessageList component
 * It is not a general purpose infinite scroll controller, because:
 * 1. It is re-rendered whenever queryInProgress, hasNext, hasPrev changes. This can lead to scrollListener to have stale data.
 * 2. It pretends to invoke scrollListener on resize event even though this event is emitted only on window resize. It should
 * rather use ResizeObserver. But then again, it ResizeObserver would invoke a stale version of scrollListener.
 *
 * In general, the infinite scroll controller should not aim for checking the loading state and whether there is more data to load.
 * That should be controlled by the loading function.
 */
export const InfiniteScroll = (props) => {
    const { children, element = 'div', hasMore, hasMoreNewer, hasNextPage, hasPreviousPage, head, initialLoad = true, isLoading, listenToScroll, loader, loadMore, loadMoreNewer, loadNextPage, loadPreviousPage, threshold = DEFAULT_LOAD_PAGE_SCROLL_THRESHOLD, useCapture = false, ...elementProps } = props;
    const loadNextPageFn = loadNextPage || loadMoreNewer;
    const loadPreviousPageFn = loadPreviousPage || loadMore;
    const hasNextPageFlag = hasNextPage || hasMoreNewer;
    const hasPreviousPageFlag = hasPreviousPage || hasMore;
    const scrollComponent = useRef(undefined);
    const previousOffset = useRef(undefined);
    const previousReverseOffset = useRef(undefined);
    const scrollListenerRef = useRef(undefined);
    scrollListenerRef.current = () => {
        const element = scrollComponent.current;
        if (!element || element.offsetParent === null) {
            return;
        }
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const parentElement = element.parentElement;
        const offset = element.scrollHeight - parentElement.scrollTop - parentElement.clientHeight;
        const reverseOffset = parentElement.scrollTop;
        if (listenToScroll) {
            listenToScroll(offset, reverseOffset, threshold);
        }
        if (isLoading)
            return;
        if (previousOffset.current === offset &&
            previousReverseOffset.current === reverseOffset)
            return;
        previousOffset.current = offset;
        previousReverseOffset.current = reverseOffset;
        // FIXME: this triggers loadMore call when a user types messages in thread and the scroll container expands
        if (reverseOffset < Number(threshold) &&
            typeof loadPreviousPageFn === 'function' &&
            hasPreviousPageFlag) {
            loadPreviousPageFn();
        }
        if (offset < Number(threshold) &&
            typeof loadNextPageFn === 'function' &&
            hasNextPageFlag) {
            loadNextPageFn();
        }
    };
    useEffect(() => {
        deprecationAndReplacementWarning([
            [{ hasMoreNewer }, { hasNextPage }],
            [{ loadMoreNewer }, { loadNextPage }],
            [{ hasMore }, { hasPreviousPage }],
            [{ loadMore }, { loadPreviousPage }],
        ], 'InfiniteScroll');
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    useEffect(() => {
        const scrollElement = scrollComponent.current?.parentNode;
        if (!scrollElement)
            return;
        const scrollListener = () => scrollListenerRef.current?.();
        scrollElement.addEventListener('scroll', scrollListener, useCapture);
        scrollElement.addEventListener('resize', scrollListener, useCapture);
        scrollListener();
        return () => {
            scrollElement.removeEventListener('scroll', scrollListener, useCapture);
            scrollElement.removeEventListener('resize', scrollListener, useCapture);
        };
    }, [initialLoad, useCapture]);
    useEffect(() => {
        const scrollElement = scrollComponent.current?.parentNode;
        if (scrollElement) {
            scrollElement.addEventListener('wheel', mousewheelListener, { passive: false });
        }
        return () => {
            if (scrollElement) {
                scrollElement.removeEventListener('wheel', mousewheelListener, useCapture);
            }
        };
    }, [useCapture]);
    const attributes = {
        ...elementProps,
        ref: (element) => {
            scrollComponent.current = element;
        },
    };
    const childrenArray = [loader, children];
    if (head) {
        childrenArray.unshift(head);
    }
    return React.createElement(element, attributes, childrenArray);
};
