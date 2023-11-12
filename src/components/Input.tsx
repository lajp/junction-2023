import { AnimatePresence } from 'framer-motion';
import { forwardRef, useState, useEffect } from 'react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

type InputProps = {
  label?: string;
  error?: string;
  speechRecog?: boolean;
  onMicChange?: (shouldListen: boolean) => void;
  listening?: boolean;
  isTextArea?: boolean;
  secondPlaceholder?: string;
} & React.ComponentPropsWithoutRef<'input'>;

export const Input = forwardRef<HTMLTextAreaElement, InputProps>(
  (
    {
      onChange,
      value,
      label,
      error,
      listening,
      speechRecog,
      onMicChange,
      isTextArea,
      onSubmit,
      placeholder,
      secondPlaceholder,
      ...props
    },
    ref
  ) => {
    const [hasText, setHasText] = useState(value ? true : false);

    const handleChange = (e: any) => {
      if (onChange) {
        onChange(e);
      }
      setHasText(e.target.value.length > 0);
    };

    useEffect(() => {
      if (listening) {
        toast.message('Listening...');
      } else {
        toast.dismiss();
      }
    }, [listening]);

    useEffect(() => {
      setHasText(value ? true : false);
    }, [value]);

    return (
      <div className={isTextArea ? '-mb-36' : ''}>
        {label && (
          <div className="mb-2">
            <label className="font-bold text-2xl sm:text-3xl">
              <span>{label}</span>
            </label>
          </div>
        )}
        <div className="flex gap-1 relative">
          <AnimatePresence>
            {speechRecog && onMicChange && (!hasText || listening) && (
              <motion.button
                initial={{ opacity: 0, x: -5 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -5 }}
                transition={{ type: 'tween' }}
                type="button"
                className=" pt-[0.175rem] sm:pt-[0.05rem] absolute -left-7 md:-left-9 lg:-left-10"
                onClick={() => (!listening ? onMicChange(true) : onMicChange(false))}
              >
                {listening ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="md:w-9 md:h-9 h-7 w-7 hover:scale-105 transition text-neutral-400"
                    viewBox="0 0 24 24"
                  >
                    <path
                      fill="currentColor"
                      d="M12 2a3 3 0 0 1 3 3v6a3 3 0 0 1-3 3a3 3 0 0 1-3-3V5a3 3 0 0 1 3-3m7 9c0 3.53-2.61 6.44-6 6.93V21h-2v-3.07c-3.39-.49-6-3.4-6-6.93h2a5 5 0 0 0 5 5a5 5 0 0 0 5-5h2Z"
                    />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="md:w-9 md:h-9 h-7 w-7 hover:scale-105 transition text-neutral-400"
                    viewBox="0 0 24 24"
                  >
                    <path
                      fill="currentColor"
                      d="M17.3 11c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.49 6-3.31 6-6.72m-8.2-6.1c0-.66.54-1.2 1.2-1.2c.66 0 1.2.54 1.2 1.2l-.01 6.2c0 .66-.53 1.2-1.19 1.2c-.66 0-1.2-.54-1.2-1.2M12 14a3 3 0 0 0 3-3V5a3 3 0 0 0-3-3a3 3 0 0 0-3 3v6a3 3 0 0 0 3 3Z"
                    />
                  </svg>
                )}
              </motion.button>
            )}
          </AnimatePresence>
          {isTextArea ? (
            // @ts-expect-error
            <textarea
              {...props}
              placeholder={placeholder}
              rows={5}
              ref={ref}
              value={value}
              onChange={handleChange}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && !event.shiftKey) {
                  event.preventDefault();
                  // @ts-expect-error
                  onSubmit?.(event);
                }
              }}
              className={`placeholder:font-bold transition w-full overflow-auto resize-none font-medium placeholder:text-neutral-400 text-2xl sm:text-3xl outline-none disabled:bg-white ${
                !hasText ? 'placeholder:opacity-100' : 'placeholder:opacity-0'
              }`}
            />
          ) : (
            <AnimatePresence>
              <motion.input
                initial={{ opacity: 0, y: secondPlaceholder ? 20 : 0 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 0 }}
                {...props}
                // @ts-expect-error
                ref={ref}
                placeholder={placeholder}
                value={value}
                onChange={handleChange}
                className={`placeholder:font-bold transition w-full overflow-auto resize-none font-medium placeholder:text-neutral-400 text-2xl sm:text-3xl outline-none disabled:bg-white ${
                  !hasText ? 'placeholder:opacity-100' : 'placeholder:opacity-0'
                }`}
              />
            </AnimatePresence>
          )}
        </div>
        {error && <div className="text-sm sm:text-xl text-neutral-400 absolute top-[4.5rem] mt-2.5">{error}</div>}
      </div>
    );
  }
);
