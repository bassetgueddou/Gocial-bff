declare module 'react-native-heading' {
    const Heading: {
        start: (updateRate: number) => Promise<boolean>;
        stop: () => void;
        on: (callback: (heading: number) => void) => void;
    };
    export default Heading;
}

declare module "react-native-vector-icons/MaterialIcons";
declare module "react-native-vector-icons/FontAwesome";