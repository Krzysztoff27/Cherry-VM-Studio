import React from "react";

export interface AsciiArtProps {
    text: string;
    label: string;
    caption?: React.JSX.Element | string;
}

const AsciiArt = ({ text, label, caption }: AsciiArtProps): React.JSX.Element => {
    return (
        <figure>
            <pre
                role="img"
                aria-label={label}
                style={{
                    whiteSpace: "pre",
                    fontFamily: "monospace",
                    lineHeight: "1",
                }}
            >
                {text}
            </pre>
            <figcaption>{caption}</figcaption>
        </figure>
    );
};

export default AsciiArt;
