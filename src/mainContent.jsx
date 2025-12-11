import { useRef, useState, useEffect } from "react";
import { AlertCircle, Loader2, Clock, Sparkles, AlertTriangle } from "lucide-react";
import { motion } from "motion/react"
import DescriptionsList from "./DescriptionsList";

const MAX_REQUESTS = 3;
const RATE_LIMIT_STORAGE_KEY = "descripta-rate-limit";

export default function MainContent() {
    const inputRef1 = useRef(null);
    const inputRef2 = useRef(null);
    const [formData, setFormData] = useState({
        productName: '',
        features: '',
        targetAudience: ''
    });
    const [tone, setTone] = useState('professional');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [descriptions, setDescriptions] = useState([]);
    const toneOptions = [
        { id: 'professional', label: 'Professional', description: 'Formal and business-oriented' },
        { id: 'casual', label: 'Casual', description: 'Friendly and conversational' },
        { id: 'seo', label: 'SEO-Optimized', description: 'Keyword-rich for search engines' }
    ];
    const [errors, setErrors] = useState({});
    const [canGenerate, setCanGenerate] = useState(true);
    const [cooldown, setCooldown] = useState(0);
    const [requestCount, setRequestCount] = useState(0);
    const [remainingRequests, setRemainingRequests] = useState(MAX_REQUESTS);

    const startCooldown = (seconds) => {
        if (seconds <= 0) return;
        setCanGenerate(false);
        setCooldown(Math.ceil(seconds));

        const interval = setInterval(() => {
            setCooldown(prev => {
                if (prev <= 1) {
                    clearInterval(interval);
                    setCanGenerate(true);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    const persistRateLimitState = (count, resetTime) => {
        try {
            const payload = { count, resetTime };
            localStorage.setItem(RATE_LIMIT_STORAGE_KEY, JSON.stringify(payload));
        } catch {

        }
    };

    const hydrateRateLimitState = () => {
        try {
            const raw = localStorage.getItem(RATE_LIMIT_STORAGE_KEY);
            if (!raw) return;
            const parsed = JSON.parse(raw);
            if (!parsed?.resetTime || typeof parsed.count !== "number") return;

            const now = Date.now();
            if (parsed.resetTime > now) {
                const remaining = Math.max(0, MAX_REQUESTS - parsed.count);
                setRequestCount(parsed.count);
                setRemainingRequests(remaining);

                if (remaining === 0) {
                    const seconds = Math.ceil((parsed.resetTime - now) / 1000);
                    startCooldown(seconds);
                }
            } else {
                localStorage.removeItem(RATE_LIMIT_STORAGE_KEY);
            }
        } catch {
            localStorage.removeItem(RATE_LIMIT_STORAGE_KEY);
        }
    };

    useEffect(() => {
        hydrateRateLimitState();
    }, []);

    function handleChange(e) {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        if (errors[e.target.name]) {
            setErrors({
                ...errors,
                [e.target.name]: ''
            });
        }
    }
    async function handleSubmit(e) {
        e.preventDefault();

        setError('');

        if (!validateForm()) {
            return;
        }

        if (!canGenerate) {
            return;
        }

        setLoading(true);

        try {
            const toneInstructions = {
                professional: 'Write in a professional, formal tone suitable for B2B or premium products. Use industry terminology and emphasize quality and reliability.',
                casual: 'Write in a casual, friendly tone that connects with everyday consumers. Use conversational language and focus on lifestyle benefits.',
                seo: 'Write SEO-optimized descriptions that naturally incorporate relevant keywords. Focus on searchable terms while maintaining readability.'
            };

            const userPrompt = `Generate 3 unique product descriptions for the following product:
Product Name: ${formData.productName}
Key Features: ${formData.features}
Target Audience: ${formData.targetAudience}
Tone: ${toneInstructions[tone]}
Requirements:
- Generate exactly 3 different descriptions
- Each should be 50-100 words
- Highlight benefits, not just features
- Make each version unique while maintaining the specified tone
- Format as JSON with a "descriptions" array
- Return ONLY the JSON, no additional text`;

            const response = await fetch('/api/gemini', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ prompt: userPrompt })
            });

            const data = await response.json();

            if (!response.ok) {
                if (response.status === 429) {
                    setError(data.error || 'Rate limit exceeded. Please try again later.');
                    const resetTime = data.resetTime || (Date.now() + 60 * 60 * 1000);
                    setRemainingRequests(0);
                    setRequestCount(MAX_REQUESTS);
                    persistRateLimitState(MAX_REQUESTS, resetTime);

                    const seconds = Math.max(0, Math.ceil((resetTime - Date.now()) / 1000));
                    startCooldown(seconds);
                    return;
                }
                throw new Error(data.error || 'Failed to generate content');
            }

            const text = data.text;

            if (text.includes("Sorry, I can only help you with product descriptions.")) {
                setError('Invalid request. Please provide valid product information.');
                return;
            }

            let cleanContent = text.trim();
            cleanContent = cleanContent.replace(/```json\n?/g, '').replace(/```\n?/g, '');
            const jsonMatch = cleanContent.match(/\{[\s\S]*\}/);

            if (jsonMatch) {
                let parsed;
                try {
                    parsed = JSON.parse(jsonMatch[0]);
                } catch (parseError) {
                    console.error('JSON parsing error:', parseError);
                    throw new Error('Invalid JSON format in response');
                }

                if (parsed.descriptions && Array.isArray(parsed.descriptions)) {
                    setDescriptions(parsed.descriptions);

                    const newRemaining = data.remaining ?? remainingRequests - 1;
                    const resetTime = data.resetTime || (Date.now() + 60 * 60 * 1000);
                    setRemainingRequests(newRemaining);
                    const used = MAX_REQUESTS - newRemaining;
                    setRequestCount(used);
                    persistRateLimitState(used, resetTime);

                    if (newRemaining > 0) {
                        startCooldown(30);
                    } else {
                        const seconds = Math.max(0, Math.ceil((resetTime - Date.now()) / 1000));
                        startCooldown(seconds);
                    }
                } else {
                    throw new Error('Invalid response format');
                }
            } else {
                throw new Error('Could not parse response');
            }
        } catch (err) {
            console.error('Error', err);
            setError("We couldn't generate descriptions just now. Please try again in a moment.");
        } finally {
            setLoading(false);
        }
    }
    function validateForm() {
        const newErrors = {};
        let isValid = true;
        if (!formData.productName.trim()) {
            newErrors.productName = 'Please enter a product name';
            isValid = false;
        }
        if (!formData.features.trim()) {
            newErrors.features = "Please enter the product's features";
            isValid = false;
        }
        setErrors(newErrors);
        if (newErrors.productName) {
            inputRef1.current?.focus();
        }
        else if (newErrors.features) {
            inputRef2.current?.focus();
        }
        return isValid;
    }
    return (
        <>
            <div className="bg-gray-100 min-h-[140vh] h-auto w-[100%] flex flex-col items-center">
                <div className="flex flex-col items-center p-2 gap-4 py-16">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        viewport={{ once: true }}
                        className="font-extrabold text-2xl md:text-3xl lg:text-4xl text-primary">Try it now</motion.div>
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        viewport={{ once: true }}
                        className="text-center text-[1.4rem]">Enter your product details and watch the magic happen</motion.div>
                </div>
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1.2 }}
                    viewport={{ once: true }}
                    className="backdrop-blur-lg bg-[#f5f5fd] border border-white/10 hadow-lg ring-1 ring-white/6 w-10/12 sm:w-3/4 max-w-3xl p-4 m-8 rounded-3xl shadow-2xl">

                    <form onSubmit={handleSubmit} className="text-black flex flex-col gap-4 justify-center items-center">
                        <label htmlFor="productName" className="text-[1.2rem]">Product Name:</label>
                        <input type="text" ref={inputRef1} value={formData.productName} onChange={handleChange} id="productName" name="productName" className={`text-black border-2 border-gray-200 h-15 bg-white rounded-[8px] p-2 w-full max-w-md ${errors.productName ? 'border-red-500' : ''}`} placeholder="e.g. Premium Wireless Headphones" />
                        {errors.productName && <div className="text-red-500">{errors.productName}</div>}

                        <label htmlFor="features" className="text-[1.2rem]">Features:</label>
                        <input type="text" ref={inputRef2} value={formData.features} onChange={handleChange} id="features" name="features" className={`text-black border-2 border-gray-200 h-15 bg-white rounded-[8px] p-2 w-full max-w-md ${errors.features ? 'border-red-500' : ''}`} placeholder="e.g. 40-hour battery life, active noise cancellation" />
                        {errors.features && <div className="text-red-500">{errors.features}</div>}

                        <label htmlFor="targetAudience" className="text-[1.2rem]">Target Audience (Optional):</label>
                        <input type="text" value={formData.targetAudience} onChange={handleChange} id="targetAudience" name="targetAudience" className="text-black border-2 border-gray-200 h-15 bg-white rounded-[8px] p-2 w-full max-w-md" placeholder="e.g. Remote workers, students, fitness enthusiasts" />

                        <div className="text-[1.2rem]">Tone Preference:</div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 items-center w-[100%] gap-4">
                            {toneOptions.map((option) => <button type="button" key={option.id} onClick={() => setTone(option.id)} className={`min-h-30 h-auto w-auto border-2 rounded-3xl p-4 cursor-pointer  hover:bg-[#2494A233] hover:scale-105 transition-all duration-200 ${tone === option.id ? 'border-accent bg-[#2494A233]' : 'border-gray-200 hover:border-accent'}`}><div className="text-[1.1rem]">{option.label}</div>{option.description}</button>)}
                        </div>
                        <p className="text-sm text-gray-600">
                            <span className="font-semibold text-emphasis">{requestCount}</span>
                            <span className="text-black">/{MAX_REQUESTS} generations used this hour</span>
                        </p>
                        <button type="submit" disabled={loading || !canGenerate} className="text-white bg-accent/80 h-12 w-full max-w-md rounded-[4px] cursor-pointer hover:bg-accent transition-colors duration-200 ">{loading ? <div className="flex justify-center items-center gap-2"><Loader2 size='24px' className="animate-spin" />Generating...</div> : !canGenerate ? (
                            <>
                                <div className="flex justify-center items-center gap-2"><Clock className="w-5 h-5" />
                                    Wait {cooldown}s </div>
                            </>
                        ) : (
                            <>
                                <div className="flex justify-center items-center gap-2"><Sparkles className="w-5 h-5" />
                                    Generate</div>

                            </>
                        )}</button>
                        <div className="text-center mt-3">
                        </div>
                        {remainingRequests <= 2 && remainingRequests > 0 && (
                            <div className="mt-3 p-3 flex justify-center items-center gap-2 bg-highlight border border-yellow-200 rounded-[4px] w-full max-w-md">
                                <AlertTriangle size="20px" color="red" />
                                <p className="text-xs text-white text-center">
                                    You're running low — Only {remainingRequests} generation{remainingRequests === 1 ? '' : 's'} remaining
                                </p>
                            </div>
                        )}
                    </form>
                </motion.div>
                {error && <div className="text-red-500 bg-red-50 flex justify-center items-center rounded-4xl  h-auto w-full max-w-xs sm:max-w-sm md:max-w-sm lg:max-w-md  p-4 border-2 m-4 border-red-500 gap-2"><AlertCircle className="animate-pulse" /><div>{error}</div></div>}

                <DescriptionsList descriptions={descriptions} />
            </div>
        </>
    );
}