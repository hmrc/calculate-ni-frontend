import React, {Dispatch} from "react";

interface SuccessNotificationContextProps {
  successNotificationsOn: boolean
  setSuccessNotificationsOn: Dispatch<boolean>
}

export const SuccessNotificationContext = React.createContext<SuccessNotificationContextProps>(
  {
    successNotificationsOn: true,
    setSuccessNotificationsOn: () => {}
  }
)
