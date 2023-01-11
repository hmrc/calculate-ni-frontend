/*
 * Copyright 2023 HM Revenue & Customs
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package eoi

import magnolia._
import org.scalacheck.Gen.Parameters
import org.scalacheck.rng.Seed
import org.scalacheck.{Arbitrary, Gen}

import scala.language.experimental.macros

/** Borrowed from [[https://github.com/laurence-bird/scalacheck-magnolia]] */
trait DeriveArbitrary {
  /** Parameters to configure scalacheck generators */
  implicit def parameters: Parameters

  /** binds the Magnolia macro to this derivation object */
  implicit def gen[T]: Arbitrary[T] = macro Magnolia.gen[T]
  /** type constructor for new instances of the typeclass */
  type Typeclass[T] = Arbitrary[T]

  /** defines how new Arbitrary typeclasses for nested case classes should be constructed */
  def combine[T](ctx: CaseClass[Arbitrary, T]): Arbitrary[T] = {
     def t: T = ctx.construct { param: Param[Typeclass, T] =>
      param
        .typeclass
        .arbitrary
        .pureApply(parameters, Seed.random())
    }
    Arbitrary(Gen.delay(t))
  }

  /** Given a sealed trait, picks a random Arbitrary instance for one of the elements*/
  def dispatch[T](ctx: SealedTrait[Arbitrary, T]): Arbitrary[T] = {
    import scala.util.Random
    /** Pick a random instance of the sealed trait to summon an arbitrary for */

    def t = Random
      .shuffle(ctx.subtypes)
      .head
      .typeclass
      .arbitrary
      .pureApply(parameters, Seed.random())

    Arbitrary(Gen.delay(t))
  }
}
