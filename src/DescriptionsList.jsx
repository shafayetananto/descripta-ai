import { useState } from "react";
import DescriptionCard from "./DescriptionCard";

export default function DescriptionsList({ descriptions }) {
    const [copiedIndex, setCopiedIndex] = useState(null);
    async function copyToClipboard(text, index) {
        try {
            await navigator.clipboard.writeText(text);
            setCopiedIndex(index);
            setTimeout(() => setCopiedIndex(null), 2000);
        } catch (err) {
            console.error("Failed to copy!", err);
        }
    }
    if (descriptions.length === 0) {
        return null;
    }
    return (
        <div className="flex flex-col lg:flex-row gap-8 mb-40">
            {descriptions.map((description, index) => (
                <DescriptionCard
                    key={index}
                    description={description}
                    index={index}
                    copiedIndex={copiedIndex}
                    onCopy={copyToClipboard}
                />
            ))}
        </div>
    );
}

