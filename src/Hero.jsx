import { motion } from "motion/react";
import { Bot } from 'lucide-react';
export default function Hero() {
    return (
        <section className="hero relative bg-[linear-gradient(135deg,#667eea_0%,#764ba2_100%)] text-white overflow-hidden pl-[2rem] pr-[2rem] pt-[8rem] pb-[6rem] text-center">
            <div className="float-element float-1 absolute rounded-full bg-[rgba(255,255,255,0.1)] w-[100px] h-[100px] top-[10%] left-[10%]"></div>
            <div className="float-element float-2 absolute rounded-full bg-[rgba(255,255,255,0.1)] w-[150px] h-[150px] top-[60%] right-[15%] float-1"></div>
            <div className="float-element float-3 absolute rounded-full bg-[rgba(255,255,255,0.1)] w-[80px]  h-[80px] bottom-[20%] left-[20%]"></div>

            <div className="hero-content flex flex-col justify-center items-center m-2">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.5 }}
                    viewport={{ once: true }}
                    className="bg-[rgba(255,255,255,0.2)] pl-4 pr-4 pt-2 pb-2 text-[0.875rem] mb-2 font-bold rounded-3xl flex justify-center items-center gap-2 w-xs"><Bot /> <span>AI-Powered</span> </motion.div>
                <h1
                    className="animate-fade-up text-2xl md:text-3xl lg:text-4xl font-bold mb-2">Generate Product Descriptions in Seconds</h1>
                <p
                    className="animate-fade-up text-xl md:text-2xl opacity-95 mb-2">Transform your product features into compelling descriptions with AI. Get professional, casual, and SEO-optimized versions instantly.</p>
            </div>
        </section>
    )
}