// import { useContext } from "react";
import { Route, Redirect } from "react-router-dom";

import usePrepareLink from "../../hooks/router/usePrepareLink";

const NetworkRoute = ({ children, isOnline, ...rest })=>{
    // console.log(isOnline)
    const loginLink = usePrepareLink({
        to: "/library",
        isRelativePath: true,
    });

    return (
        <Route {...rest}
            render={
                ({ location }) => {
                    return (isOnline)?(children):(<Redirect to={{...loginLink, state: { from: location } }} />)
                }
            }
        />
    )
}
 export default NetworkRoute;