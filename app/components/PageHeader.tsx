"use client";

type PageHeaderProps = {
    title: string;
    subtitle?: string;
    align?: "left" | "center" | "right";
    size?: "sm" | "md" | "lg";
    titleColor?: string; // Tailwind class
    subtitleColor?: string;
    accent?: boolean; // underline / highlight
    emoji?: string;
    className?: string;
};

export default function PageHeader({
    title,
    subtitle,
    align = "center",
    size = "md",
    titleColor = "text-gray-800",
    subtitleColor = "text-gray-600",
    accent = false,
    emoji,
    className = "",
}: PageHeaderProps) {
    const alignClass = {
        left: "text-left",
        center: "text-center",
        right: "text-right",
    }[align];

    const titleSizeClass = {
        sm: "text-2xl md:text-3xl",
        md: "text-3xl md:text-4xl",
        lg: "text-4xl md:text-5xl",
    }[size];

    return (
        <div
            className={`w-full max-w-6xl mx-auto mb-8 px-4 ${alignClass} ${className}`}
        >
            <h1 className={`font-extrabold ${titleSizeClass} ${titleColor}`}>
                {emoji && <span className="mr-2">{emoji}</span>}
                {title}
            </h1>

            {accent && (
                <div className="mt-3 h-1 w-20 bg-primary mx-auto rounded-full" />
            )}

            {subtitle && (
                <p className={`mt-3 text-sm md:text-base ${subtitleColor}`}>
                    {subtitle}
                </p>
            )}
        </div>
    );
}
