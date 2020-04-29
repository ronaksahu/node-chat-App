const generateMessage = (username, text) => {
    return {
        username,
        text,
        createdAt: new Date().getTime()
    }
}

const generateBanner = (text) => {
    return {
        text,
        createdAt: new Date().getTime()
    }
}

module.exports = {
    generateMessage,
    generateBanner
}