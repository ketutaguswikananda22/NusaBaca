export default function ApplicationLogo(props) {
    return (
        <img 
            {...props} 
            src="/image/nusa.png"  // Tambahkan / di awal
            alt="NusaBaca Logo" 
            className={`h-10 w-auto ${props.className || ''}`} 
        />
    );
}