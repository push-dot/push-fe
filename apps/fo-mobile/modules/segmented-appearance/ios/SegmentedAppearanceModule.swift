import ExpoModulesCore
import UIKit

public class SegmentedAppearanceModule: Module {
  public func definition() -> ModuleDefinition {
    Name("SegmentedAppearance")

    Function("setTitleFont") { (name: String, size: Double) in
      guard let font = UIFont(name: name, size: CGFloat(size)) else { return }
      DispatchQueue.main.async {
        let attributes: [NSAttributedString.Key: Any] = [.font: font]
        let appearance = UISegmentedControl.appearance()
        appearance.setTitleTextAttributes(attributes, for: .normal)
        appearance.setTitleTextAttributes(attributes, for: .selected)
      }
    }
  }
}
