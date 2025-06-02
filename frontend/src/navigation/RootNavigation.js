import {
  createNavigationContainerRef,
  CommonActions,
} from '@react-navigation/native';

// 🌐 Create navigation reference
export const navigationRef = createNavigationContainerRef();

// ✅ Basic navigate function (for use outside components)
export function navigate(name, params) {
  if (navigationRef.isReady()) {
    navigationRef.navigate(name, params);
  }
}

// 🔁 Reset navigation stack (useful for logout or auth redirect)
export function resetTo(name) {
  if (navigationRef.isReady()) {
    navigationRef.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{name}],
      }),
    );
  }
}
