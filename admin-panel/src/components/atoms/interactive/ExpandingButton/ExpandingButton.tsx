import { Button } from "@mantine/core";
import {motion} from "framer-motion";

const ExpandingButton = ({w, parentGap = '0', mounted, children, ease = 'easeInOut', duration = 0.3, ...props}): React.JSX.Element => {
    console.log(parentGap)

    return (
        <motion.div
            initial={{ 
                width: 0, 
                opacity: 0,
                marginRight: `-${parentGap}`
            }}
            animate={{
                width: mounted ? w : 0,
                opacity: mounted ? 1 : 0,
                marginRight: mounted ? 0 : `-${parentGap}`,
            }}
            transition={{ duration: duration, ease: ease }}
            style={{ 
                overflow: "hidden", 
                display: "flex",
            }} 
            autoFocus={mounted}
        >
            <Button w='100%' autoFocus={mounted} {...props}>
                {children}
            </Button>
        </motion.div>
    );
}

export default ExpandingButton;