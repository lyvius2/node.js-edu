/**
 * Created by lyvius2 on 2015-12-07.
 */
exports.createAuthFunctions = function(){
    var obj = {
        isAuthenticated : function(req,res,next){
            if(req.isAuthenticated()){
                //req.session.touch();
                console.log('req.session.cookie.expires after',req.session);
                return next();
            }
            res.redirect('/login');
        },
        logout : function(req,res){
            req.logout();
            res.redirect(301,'/login');
        }
    }
    return obj;
}