

const getChatPage = (req, res) => {
    console.log("redering chat page");
    
    res.render("chat")
}




module.exports = {
    getChatPage
}