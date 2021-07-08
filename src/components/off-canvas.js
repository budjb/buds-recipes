import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react';
import _ from 'lodash';
import { useSwipeable } from 'react-swipeable';

/**
 * Transitions the off-canvas to a percentage open with a given animation duration, in milliseconds.
 *
 * @param element
 * @param duration
 * @param percent
 */
const doTransition = (element, duration, percent) => {
  element.style.transform = `translateX(-${percent}%)`;
  element.style.transitionDuration = duration + 'ms';
};

export const OffCanvas = forwardRef(({ children, duration = 300, threshold = 33 }, ref) => {
  /**
   * Track whether the initial swipe was either to the left or right,
   * and lock the axis (open/close off-canvas vs vertical scroll) based on
   * the original scroll direction for the duration of the swipe.
   */
  const [isHorizontalSwipe, setIsHorizontalSwipe] = useState(false);

  /**
   * Whether the off-canvas is open or closed.
   */
  const [isOpen, setOpen] = useState(false);

  /**
   * Reference to the off-canvas element.
   *
   * @type {React.RefObject<Element>}
   */
  const offCanvasRef = useRef();

  /**
   * Opens the off-canvas with the configured duration.
   *
   * @param d
   */
  const open = useCallback(
    (d = duration) => {
      doTransition(offCanvasRef.current, d, 100);
      setOpen(true);
    },
    [offCanvasRef, setOpen, duration]
  );

  /**
   * Closes the off-canvas with the configured duration.
   */
  const close = useCallback(
    (d = duration) => {
      doTransition(offCanvasRef.current, d, 0);
      setOpen(false);
    },
    [offCanvasRef, setOpen, duration]
  );

  /**
   * Expose open and close methods to the provided ref.
   */
  useImperativeHandle(ref, () => ({
    open: open,
    close: close,
  }));

  /**
   * Event handler for the very beginning of a swipe.
   */
  const onSwipeStart = eventData => {
    if (['Left', 'Right'].includes(eventData.dir)) {
      setIsHorizontalSwipe(true);
    }
  };

  /**
   * Event handler for when a swipe has completed.
   */
  const onSwiped = eventData => {
    if (!isHorizontalSwipe) {
      return;
    }

    const element = offCanvasRef.current;

    const velocity = Math.abs(eventData.vxvy[0]);
    const width = element.clientWidth;
    const deltaX = _.clamp(isOpen ? eventData.deltaX : eventData.deltaX * -1, 0, width);
    const deltaPercent = (deltaX / width) * 100;
    const animationTime = Math.min(duration, (width - deltaX) / velocity);

    if (isOpen) {
      if (deltaPercent < threshold) {
        open();
      } else {
        close(animationTime);
      }
    } else {
      if (deltaPercent < threshold) {
        close();
      } else {
        open(animationTime);
      }
    }

    setIsHorizontalSwipe(false);
  };

  /**
   * Event handler for when a swipe is ongoing.
   *
   * @param eventData
   */
  const onSwiping = eventData => {
    if (!isHorizontalSwipe) {
      return;
    }

    const element = offCanvasRef.current;

    const width = element.clientWidth;
    const deltaX = _.clamp(isOpen ? eventData.deltaX : eventData.deltaX * -1, 0, width);
    const deltaPercent = (deltaX / width) * 100;
    const percent = isOpen ? 100 - deltaPercent : deltaPercent;

    doTransition(element, 0, percent);
  };

  /**
   * Swipe configuration.
   */
  const swipeHandlers = useSwipeable({
    delta: 16,
    onSwiped,
    onSwiping,
    onSwipeStart,
  });

  /**
   * Register the swipe event handlers with the document.
   */
  useEffect(() => {
    swipeHandlers.ref(document.documentElement);
  }, [swipeHandlers]);

  /**
   * Prevent vertical scrolling when a horizontal swipe is ongoing.
   */
  useEffect(() => {
    if (isHorizontalSwipe) {
      if (document.scrollingElement) {
        document.scrollingElement.classList.add('lock-scroll');
      }
    } else {
      if (document.scrollingElement) {
        document.scrollingElement.classList.remove('lock-scroll');
      }
    }
  }, [isHorizontalSwipe]);

  /**
   * Lock the body when the off-canvas is open on mobile clients.
   */
  useEffect(() => {
    if (isOpen) {
      if (document.scrollingElement) {
        document.scrollingElement.classList.add('lock-scroll-lg');
      }
    } else {
      if (document.scrollingElement) {
        document.scrollingElement.classList.remove('lock-scroll-lg');
      }
    }
  }, [offCanvasRef, isOpen, duration]);

  /**
   * Hand click events so that any click outside the off-canvas when it is shown will close it.
   *
   * @type {function(*): void}
   */
  const handleMenuClick = useCallback(
    event => {
      if (isOpen && offCanvasRef.current && !offCanvasRef.current.contains(event.target)) {
        close();
      }
    },
    [offCanvasRef, isOpen, close]
  );

  /**
   * Handle escape key to close menu when it is open.
   *
   * @type {function(*): void}
   */
  const handleEscape = useCallback(
    event => {
      if (event.keyCode === 27 && isOpen) {
        event.preventDefault();
        close();
      }
    },
    [isOpen, close]
  );

  /**
   * Register click and keyboard handlers.
   */
  useEffect(() => {
    document.addEventListener('mousedown', handleMenuClick);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleMenuClick);
      document.removeEventListener('keydown', handleEscape);
    };
  });

  return (
    <div className="offcanvas-collapse" ref={offCanvasRef}>
      {children}
    </div>
  );
});
