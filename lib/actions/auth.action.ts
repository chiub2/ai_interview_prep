// auth.action.ts - Server actions for handling user authentication
// This file contains functions for user sign-up, sign-in, and session management

'use server';  // Mark as server-side code
import { db, auth } from "@/firebase/admin"  // Import Firebase admin SDK
import { cookies } from "next/headers"  // Import for cookie management

// Define session duration (1 week in seconds)
const ONE_WEEK = 60 * 60 * 24 * 7;

// Handle user sign-up
export async function signUp(params: SignUpParams) {
    const {uid, name, email} = params;  // Extract user details
    try{
        // Check if user already exists
        const userRecord = await db.collection('users').doc(uid).get();
        if (userRecord.exists){
            return{
                success: false,
                message: "User already exists. Please sign in instead."
            }
        }

        // Create new user document in database
        await db.collection('users').doc(uid).set({
            name, email
        })

        // Return success response
        return{
            success: true,
            message: "User created successfully"
        }
    }catch (e:any){
        console.log('Error creating a user', e);

        // Handle specific error cases
        if (e.code === 'auth/email-already-exists'){
            return{
                success: false,
                message: "This email is already in use."
            }
        }

        // Return generic error response
        return {
            sucess: false,
            message: "Failed to create an account"
        }
    }
}

// Handle user sign-in
export async function signIn(params: SignInParams) {
    const {email, idToken} = params;  // Extract sign-in credentials
    try{
        // Verify user exists in Firebase
        const userRecord = await auth.getUserByEmail(email);
        if (!userRecord){
            return{
                success: false,
                message: "User does not exist. Please sign up instead."
            }
        }

        // Create session cookie and return success
        await setSessionCookie(idToken);
        return {
            success: true,
            message: "Successfully signed in"
        }
    }catch (e){
        console.log(e);
        return{
            success: false,
            message: "Failed to log into an account."
        }
    }
}

// Create and set session cookie for authenticated user
export async function setSessionCookie(idToken: string) {
    const cookieStore = await cookies();
    // Create Firebase session cookie
    const sessionCookie = await auth.createSessionCookie(idToken,{
        expiresIn: ONE_WEEK * 1000,  // Convert to milliseconds
    });
    // Set cookie in browser with security options
    cookieStore.set('session', sessionCookie, {
        maxAge: ONE_WEEK,
        httpOnly: true,  // Prevent JavaScript access
        secure: process.env.NODE_ENV === 'production',  // HTTPS only in production
        path: '/',  // Available across all paths
        sameSite: 'lax',  // Protect against CSRF
    })
}

// Get currently authenticated user
export async function getCurrentUser(): Promise<User | null> {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session')?.value;

    // Return null if no session cookie found
    if (!sessionCookie) return null;

    try{
        // Verify session cookie and get user claims
        const decodedClaims = await auth.verifySessionCookie(sessionCookie, true);
        // Get user data from database
        const userRecord = await db.collection('users').doc(decodedClaims.uid).get();
        if(!userRecord.exists) return null;
        // Return user data with ID
        return {
            ...userRecord.data(),
            id: userRecord.id,
        } as User;
    }catch(e){
        console.log(e)
        return null;
    }
}

// Check if user is authenticated
export async function isAuthenticated(){
    const user = await getCurrentUser();
    return !!user;  // Convert to boolean
}

// Handle user logout
export async function logout() {
    const cookieStore = await cookies();
    // Delete the session cookie
    cookieStore.delete('session');
    return { success: true };
}

/* 
Modification Examples:
1. Add more authentication features:
   - Add password reset
   - Add email verification
   - Add multi-factor authentication
   - Add social login providers

2. Enhance session management:
   - Add session refresh
   - Add multiple device support
   - Add session revocation
   - Add remember me option

3. Add security features:
   - Add rate limiting
   - Add IP blocking
   - Add suspicious activity detection
   - Add audit logging

4. Add user management:
   - Add user roles and permissions
   - Add account deletion
   - Add profile updates
   - Add account recovery
*/

