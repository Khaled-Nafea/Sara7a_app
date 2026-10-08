 const successResponse = (res,statusCode= 200, data={}, message="Don") => {
     return res.status(statusCode).json({message, data});
 };
 export default successResponse;
