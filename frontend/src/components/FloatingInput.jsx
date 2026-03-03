import React from 'react';

const FloatingInput = ({ label, id, type = "text", value, onChange, required = false, className = "", placeholder = " ", ...props }) => (
    <div className="relative h-[56px] mt-2">
        <input
            id={id}
            type={type}
            value={value}
            onChange={onChange}
            required={required}
            placeholder={placeholder}
            className={`peer w-full h-full px-4 pt-4 pb-1 bg-white/50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder-transparent focus:placeholder-slate-400 text-slate-900 ${className}`}
            {...props}
        />
        <label 
            htmlFor={id}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-sm transition-all peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-base peer-focus:top-2 peer-focus:translate-y-0 peer-focus:text-xs peer-focus:text-indigo-600 font-medium pointer-events-none"
        >
            {label}
        </label>
        {value && (
            <style>{`
                #${id}:not(:placeholder-shown) + label {
                    top: 0.5rem;
                    transform: translateY(0);
                    font-size: 0.75rem;
                    color: #4f46e5;
                }
            `}</style>
        )}
    </div>
);

export default FloatingInput;