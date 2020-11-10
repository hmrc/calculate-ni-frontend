package eoi
package schemaconverter

import java.io._

object SchemaConverter {

  def main(args: Array[String]): Unit = {

    val (sourceFile, destFile) = args.map{new File(_)}.toList match {
      case (s::d::Nil) => (s,d)
      case _ =>
        throw new IllegalArgumentException("Usage: HOCON_FILE TARGET_FILE")
    }

    val config = calc.fromFile(sourceFile)
    val json = EoiJsonEncoding.toJson(config)
    val pw = new PrintWriter(destFile)
    pw.write(json.toString)
    pw.close()
  }
}
