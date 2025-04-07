// Navbar.tsx - Navigation component with logout functionality
// This component provides navigation and user controls at the top of the page

'use client';  // Mark as client component
import { useRouter } from 'next/navigation';  // Import for navigation
import { logout } from '@/lib/actions/auth.action';  // Import logout function
import { Button } from './ui/button';  // Import UI button component
import { useEffect, useState } from 'react';  // Import React hooks
import { getCurrentUser } from '@/lib/actions/auth.action';  // Import getCurrentUser function

// Main Navbar component
const Navbar = () => {
    const router = useRouter();  // Initialize router
    const [isLoggedIn, setIsLoggedIn] = useState(false);  // Track login state

    // Check authentication status on mount
    useEffect(() => {
        const checkAuth = async () => {
            const user = await getCurrentUser();
            setIsLoggedIn(!!user);
        };
        checkAuth();
    }, []);

    // Handle logout
    const handleLogout = async () => {
        try {
            await logout();  // Call logout function
            setIsLoggedIn(false);  // Update login state
            router.push('/');  // Redirect to home page
        } catch (error) {
            console.error('Error logging out:', error);
        }
    };

    // Don't render if not logged in
    if (!isLoggedIn) return null;

    return (
        <div className="fixed top-4 right-4 z-50">
            <Button 
                onClick={handleLogout}
                className="bg-white/10 hover:bg-white/20 text-white transition-colors duration-200"
            >
                Logout
            </Button>
        </div>
    );
};

export default Navbar; 