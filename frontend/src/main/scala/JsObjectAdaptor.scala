package eoi
package frontend

import scala.scalajs.js
import simulacrum._

@typeclass trait JsObjectAdapter[A] {
  def toJSObject(in: A): js.Object
}
