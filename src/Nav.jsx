import { Layers } from "lucide-react";
export default function Nav() {
    return (
        <>
            <nav className="text-primary flex justify-around items-center p-2 md:p-4 lg:p-4 h-[10vh]">
                <div className='flex items-center gap-2 hover:scale-105 duration-200 transition ease-linear select-none'>
                    <a href="/" aria-label="Home" className='flex items-center gap-2'>
                        <Layers strokeWidth={2.75} className='w-[1.5rem] h-[1.5rem] md:w-[2rem] md:h-[2rem] lg:w-[2.2rem] lg:h-[2.2rem]' />
                        <span className='text-[1.5rem] md:text-[2rem] lg:text-[2.2rem] font-extrabold'>DescriptaAI</span>
                    </a>
                </div>

            </nav>
        </>
    );
}