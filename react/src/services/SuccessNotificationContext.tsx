import React, {Dispatch} from "react";

interface SuccessNotificationContext {
  successNotificationsOn: boolean
  setSuccessNotificationsOn: Dispatch<boolean>
}

export const SuccessNotificationContext = React.createContext<SuccessNotificationContext>(
  {
    successNotificationsOn: true,
    setSuccessNotificationsOn: () => {}
  }
)