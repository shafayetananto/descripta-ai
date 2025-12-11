import { MessagesSquare, Zap, BrainCircuit, Clipboard, Wrench, Infinity } from "lucide-react";
import { motion } from "motion/react";
const features = [
    {
        id: 1,
        icon: MessagesSquare,
        title: "Multiple Tones",
        description:
            "Generate descriptions in professional, casual, or SEO-optimized styles to match your brand voice.",
    },
    {
        id: 2,
        icon: Zap,
        title: "Lightning Fast",
        description:
            "Get high-quality product descriptions in seconds, not hours. Save time and boost productivity.",
    },
    {
        id: 3,
        icon: BrainCircuit,
        title: "AI-Powered",
        description:
            "Leverages advanced AI technology to create natural, engaging, and conversion-focused content.",
    },
    {
        id: 4,
        icon: Clipboard,
        title: "One-Click Copy",
        description:
            "Copy generated descriptions to your clipboard instantly and use them wherever you need.",
    },
    {
        id: 5,
        icon: Wrench,
        title: "Customizable",
        description:
            "Tailor descriptions to your target audience and highlight specific product features that matter.",
    },
    {
        id: 6,
        icon: Infinity,
        title: "Unlimited Ideas",
        description:
            "Generate multiple variations until you find the perfect description for your product.",
    },
];

export default function Section2() {
    return (
        <section className="flex flex-col justify-center items-center p-2 gap-4 py-16">
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
                className="font-extrabold text-2xl md:text-3xl lg:text-4xl text">Powerful Features</motion.div>
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
                className="text-center text-[1.4rem]">Everything you need to create compelling product content</motion.div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-10">
                {features.map((feature, index) => {
                    const Icon = feature.icon;
                    return (<motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.2, ease: "easeOut" }}
                        viewport={{ once: true }} className="shadow-xl p-4 w-full max-w-xs sm:max-w-sm md:max-w-sm lg:max-w-sm mx-auto rounded-2xl flex flex-col gap-6  items-center hover:scale-105 transition-transform ease duration-300 hover:ring-2 ring-accent"
                        key={feature.id}
                    >
                        <Icon size="40px" className="text-blue-400" />
                        <h2 className="text-[1.4rem] font-bold">{feature.title}</h2>
                        <div className="text-[rgba(0,0,0,0.6)]">{feature.description}</div>
                    </motion.div>
                    )
                }
                )}
            </div>
        </section>
    );
}