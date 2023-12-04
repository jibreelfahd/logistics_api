exports.notFound = (req, res) => {
   res.status(404).json({ sucess: false, message: 'Resource is currently unavailable, please try again later' });
}