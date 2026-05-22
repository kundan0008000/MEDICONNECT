import jwt from "jsonwebtoken"

// admin authentication middleware
const authAdmin = async (req, res, next) => {
    try {
        let atoken = req.headers.atoken
        
        // Check for Bearer token in Authorization header
        if (!atoken && req.headers.authorization) {
            const parts = req.headers.authorization.split(' ')
            if (parts.length === 2 && parts[0] === 'Bearer') {
                atoken = parts[1]
            }
        }
        
        if (!atoken) {
            return res.json({ success: false, message: 'Not Authorized Login Again' })
        }
        
        const token_decode = jwt.verify(atoken, process.env.JWT_SECRET)
        
        // Allow both main admin and registered users
        // Main admin: token_decode will be a string (email+password)
        // Registered users: token_decode will be an object with id and email
        if (typeof token_decode === 'string') {
            // Main admin check
            if (token_decode !== process.env.ADMIN_EMAIL + process.env.ADMIN_PASSWORD) {
                return res.json({ success: false, message: 'Not Authorized Login Again' })
            }
            // Main admin
            req.isMainAdmin = true
            req.adminEmail = process.env.ADMIN_EMAIL
        } else if (typeof token_decode === 'object' && token_decode.id) {
            // Registered user check - if token has an id, it's a valid user
            req.userId = token_decode.id
            req.userEmail = token_decode.email
            req.isMainAdmin = false
        } else {
            return res.json({ success: false, message: 'Not Authorized Login Again' })
        }
        
        next()
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

export default authAdmin;