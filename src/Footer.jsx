
export default function Footer() {
    return (
        <footer className="bg-[#020617] text-gray-300 py-8">
            <div className="max-w-5xl mx-auto flex flex-col items-center gap-3 text-center">
                <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-black">
                        <img src="./icon.svg" className="h-4 w-4" />
                    </div>
                    <span className="font-medium tracking-tight text-white text-2xl">
                        DescriptaAI
                    </span>
                </div>
                <p className="text-md md:text-lg text-gray-400 max-w-md">
                    AI-powered description assistant for teams who want clear, consistent copy without the busywork.
                </p>
                <p className="mt-2 text-sm text-gray-500">
                    © {new Date().getFullYear()} DescriptaAI. All rights reserved.
                </p>
            </div>
        </footer>
    );
}